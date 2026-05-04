import os
from datetime import datetime
from zoneinfo import ZoneInfo
import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.core.database import SessionLocal
from app.models.models import AutomationTask
from app.core.redis_cache import cache

def get_madrid_now():
    MADRID_TZ = ZoneInfo("Europe/Madrid")
    return datetime.now(MADRID_TZ)

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
        
        for task in tasks:
            days = task.schedule_days.split(',') if task.schedule_days else []
            if current_day in days:
                # 1. Distributed Lock via Redis (Primary protection for multi-worker environments)
                lock_key = f"lock:automation:{task.id}:{now_madrid.strftime('%Y%m%d%H%M')}"
                if cache.is_healthy:
                    locked = await cache.set(lock_key, "locked", ttl=120, nx=True)
                    if not locked:
                        continue
                
                # 2. Database last_run check (Fallback protection)
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
                            
                if should_run:
                    print(f"⏰ APScheduler Trigger: {task.name} ({task.category})")
                    
                    async with httpx.AsyncClient() as client:
                        payload = {
                            "action": "generate",
                            "task_type": task.task_type,
                            "category": task.category,
                            "triggered_by": "system_apscheduler",
                            "timestamp": datetime.utcnow().isoformat()
                        }
                        try:
                            webhook_url = N8N_THERAPY_WEBHOOK_URL if task.category == "therapy" else N8N_YOGA_WEBHOOK_URL
                            print(f"📡 Sending CRON trigger to {webhook_url} con payload: {payload}")
                            response = await client.post(webhook_url, json=payload, timeout=15.0)
                            
                            if response.status_code >= 400:
                                raise Exception(f"N8N Error {response.status_code}: {response.text}")
                                
                            task.last_run = datetime.utcnow()
                            db.commit()
                            print(f"✅ Successfully triggered scheduled task: {task.name} - Respuesta N8N: {response.text}")
                        except Exception as e:
                            print(f"❌ Failed to trigger scheduled task {task.name}: {e}")
                            
    except Exception as e:
        print(f"⚠️ Scheduler Execution Error: {e}")
    finally:
        db.close()

scheduler = AsyncIOScheduler()

def start_scheduler():
    """Initialize and start the background scheduler"""
    if not scheduler.running:
        print("🚀 Automation Scheduler (APScheduler) Starting")
        scheduler.add_job(check_automation_tasks, 'cron', minute='*')
        scheduler.start()

def stop_scheduler():
    """Shutdown the background scheduler"""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        print("🛑 Automation Scheduler Shutdown")
