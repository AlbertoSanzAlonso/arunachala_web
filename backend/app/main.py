from dotenv import load_dotenv
load_dotenv()


# Trigger reload
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.models import models
import os

from app.api import reviews, auth, gallery, schedules, yoga_classes, treatments, content, activities, upload, dashboard, rag, legacy, tags, automation
from app.routers import chat
from fastapi.staticfiles import StaticFiles

# Create Tables
models.Base.metadata.create_all(bind=engine)

from app.core.config import settings

app = FastAPI(title="Arunachala API")

# Background Scheduler for Automation Tasks (APScheduler)
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.core.database import SessionLocal
from app.models.models import AutomationTask
from datetime import datetime
import httpx
import os

async def check_automation_tasks():
    """Job that runs every minute to check and trigger scheduled tasks"""
    N8N_YOGA_WEBHOOK_URL = os.getenv("N8N_YOGA_BLOG_WEBHOOK_URL", "http://localhost:5678/webhook/arunachala-blog-yoga")
    N8N_THERAPY_WEBHOOK_URL = os.getenv("N8N_THERAPY_BLOG_WEBHOOK_URL", "http://localhost:5678/webhook/arunachala-blog-therapy")
    
    try:
        db = SessionLocal()
        now = datetime.now()
        current_day = str(now.isoweekday() % 7) # 0=Sunday, 1=Monday...
        current_time = now.strftime("%H:%M")
        
        # Find active tasks that match current day and time
        tasks = db.query(AutomationTask).filter(
            AutomationTask.is_active == True,
            AutomationTask.schedule_time == current_time
        ).all()
        
        for task in tasks:
            days = task.schedule_days.split(',') if task.schedule_days else []
            if current_day in days:
                # Check if already run in the last hour to avoid double triggers
                if not task.last_run or (now - task.last_run).total_seconds() > 3600:
                    print(f"⏰ APScheduler Trigger: {task.name} ({task.category})")
                    
                    async with httpx.AsyncClient() as client:
                        payload = {
                            "action": "generate",
                            "task_type": task.task_type,
                            "category": task.category,
                            "triggered_by": "system_apscheduler",
                            "timestamp": now.isoformat()
                        }
                        try:
                            webhook_url = N8N_THERAPY_WEBHOOK_URL if task.category == "therapy" else N8N_YOGA_WEBHOOK_URL
                            await client.post(webhook_url, json=payload, timeout=10.0)
                            task.last_run = now
                            db.commit()
                            print(f"✅ Successfully triggered scheduled task: {task.name}")
                        except Exception as e:
                            print(f"❌ Failed to trigger scheduled task {task.name}: {e}")
        
        db.close()
    except Exception as e:
        print(f"⚠️ Scheduler Execution Error: {e}")

scheduler = AsyncIOScheduler()

@app.on_event("startup")
async def startup_event():
    print("🚀 Automation Scheduler (APScheduler) Started")
    scheduler.add_job(check_automation_tasks, 'cron', minute='*')
    scheduler.start()

# Configure CORS
if settings.ALLOWED_ORIGINS:
    origins = settings.ALLOWED_ORIGINS
else:
    origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "https://arunachala-web.vercel.app"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(reviews.router, prefix="/api", tags=["reviews"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(gallery.router, prefix="/api/gallery", tags=["gallery"])
app.include_router(schedules.router)
app.include_router(yoga_classes.router)
app.include_router(treatments.router)
app.include_router(content.router)
app.include_router(activities.router)
app.include_router(upload.router)
app.include_router(dashboard.router)
app.include_router(legacy.router) # handle /api/article alias
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(rag.router)  # RAG sync endpoints
app.include_router(automation.router) # Automation tasks

app.include_router(tags.router, prefix="/api/tags", tags=["tags"])
# Mount Static Files (for uploaded images)
import os
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
def read_root():
    return {"message": "Welcome to Arunachala API"}
