import os
from datetime import datetime
from zoneinfo import ZoneInfo
import httpx
from sqlalchemy import text
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.core.database import SessionLocal
from app.models.models import AutomationTask
from app.core.redis_cache import cache

def get_madrid_now():
    MADRID_TZ = ZoneInfo("Europe/Madrid")
    return datetime.now(MADRID_TZ)


def _lock_id(task_id: int, minute_key: str) -> int:
    """Stable 31-bit id for PostgreSQL advisory locks."""
    return (task_id * 1_000_000 + int(minute_key)) % (2**31 - 1)


async def _acquire_run_lock(db, task_id: int, minute_key: str) -> tuple[bool, str | None]:
    """
    Distributed lock: Redis (preferred) or PostgreSQL advisory lock.
    Returns (acquired, backend) where backend is 'redis' | 'postgres' | None.
    """
    lock_key = f"lock:automation:{task_id}:{minute_key}"

    if cache.is_healthy:
        locked = await cache.set(lock_key, "locked", ttl=120, nx=True)
        if locked:
            return True, "redis"
        return False, None

    lock_id = _lock_id(task_id, minute_key)
    acquired = db.execute(
        text("SELECT pg_try_advisory_lock(:lock_id)"),
        {"lock_id": lock_id},
    ).scalar()
    if acquired:
        return True, "postgres"
    return False, None


def _release_run_lock(db, task_id: int, minute_key: str, backend: str | None) -> None:
    if backend != "postgres":
        return
    lock_id = _lock_id(task_id, minute_key)
    db.execute(text("SELECT pg_advisory_unlock(:lock_id)"), {"lock_id": lock_id})


async def check_automation_tasks():
    """Job that runs every minute to check and trigger scheduled tasks"""
    N8N_YOGA_WEBHOOK_URL = os.getenv("N8N_YOGA_BLOG_WEBHOOK_URL", "http://localhost:5678/webhook/arunachala-blog-yoga")
    N8N_THERAPY_WEBHOOK_URL = os.getenv("N8N_THERAPY_BLOG_WEBHOOK_URL", "http://localhost:5678/webhook/arunachala-blog-therapy")
    
    db = SessionLocal()
    try:
        now_madrid = get_madrid_now()
        current_day = str(now_madrid.isoweekday() % 7) # 0=Sunday, 1=Monday...
        current_time = now_madrid.strftime("%H:%M")
        
        # Find active tasks that match current day and time
        tasks = db.query(AutomationTask).filter(
            AutomationTask.is_active == True,
            AutomationTask.schedule_time == current_time
        ).all()
        
        minute_key = now_madrid.strftime("%Y%m%d%H%M")

        for task in tasks:
            days = task.schedule_days.split(',') if task.schedule_days else []
            if current_day not in days:
                continue

            acquired, lock_backend = await _acquire_run_lock(db, task.id, minute_key)
            if not acquired:
                continue

            try:
                # Database last_run check (extra guard against duplicate triggers)
                should_run = True
                if task.last_run:
                    try:
                        now_utc_aware = datetime.now(ZoneInfo("UTC"))
                        delta = (now_utc_aware - task.last_run).total_seconds()
                        if abs(delta) < 55:
                            should_run = False
                    except TypeError:
                        delta = (datetime.utcnow() - task.last_run).total_seconds()
                        if abs(delta) < 55:
                            should_run = False

                if not should_run:
                    continue

                print(f"⏰ APScheduler Trigger: {task.name} ({task.category})")

                async with httpx.AsyncClient() as client:
                    payload = {
                        "action": "generate",
                        "task_type": task.task_type,
                        "category": task.category,
                        "triggered_by": "system_apscheduler",
                        "timestamp": datetime.utcnow().isoformat(),
                    }
                    try:
                        webhook_url = (
                            N8N_THERAPY_WEBHOOK_URL
                            if task.category == "therapy"
                            else N8N_YOGA_WEBHOOK_URL
                        )
                        print(f"📡 Sending CRON trigger to {webhook_url} con payload: {payload}")
                        response = await client.post(webhook_url, json=payload, timeout=15.0)

                        if response.status_code >= 400:
                            raise Exception(f"N8N Error {response.status_code}: {response.text}")

                        task.last_run = datetime.utcnow()
                        db.commit()
                        print(
                            f"✅ Successfully triggered scheduled task: {task.name} - Respuesta N8N: {response.text}"
                        )
                    except Exception as e:
                        print(f"❌ Failed to trigger scheduled task {task.name}: {e}")
            finally:
                _release_run_lock(db, task.id, minute_key, lock_backend)
                            
    except Exception as e:
        print(f"⚠️ Scheduler Execution Error: {e}")
    finally:
        db.close()

scheduler = AsyncIOScheduler()

def start_scheduler():
    """Initialize and start the background scheduler (single worker in production)."""
    if os.getenv("ENABLE_SCHEDULER", "1") != "1":
        print("⏭️ Automation Scheduler disabled in this worker process")
        return

    if not scheduler.running:
        print("🚀 Automation Scheduler (APScheduler) Starting")
        scheduler.add_job(check_automation_tasks, 'cron', minute='*')
        scheduler.start()

def stop_scheduler():
    """Shutdown the background scheduler"""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        print("🛑 Automation Scheduler Shutdown")
