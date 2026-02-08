from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import httpx
import os

from app.core.database import get_db
from app.models.models import AutomationTask, User
from app.api.auth import get_current_user

router = APIRouter(prefix="/api/automation", tags=["automation"])

N8N_YOGA_WEBHOOK_URL = os.getenv("N8N_YOGA_BLOG_WEBHOOK_URL", "http://localhost:5678/webhook/arunachala-blog-yoga")
N8N_THERAPY_WEBHOOK_URL = os.getenv("N8N_THERAPY_BLOG_WEBHOOK_URL", "http://localhost:5678/webhook/arunachala-blog-therapy")

def get_webhook_url(category: str):
    if category == "therapy":
        return N8N_THERAPY_WEBHOOK_URL
    return N8N_YOGA_WEBHOOK_URL

class TaskBase(BaseModel):
    name: str
    task_type: str
    category: Optional[str] = None
    schedule_type: str = "weekly"
    schedule_days: Optional[str] = None
    schedule_time: str = "09:00"
    is_active: bool = False

class TaskResponse(TaskBase):
    id: int
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None

    class Config:
        from_attributes = True

class TriggerRequest(BaseModel):
    task_type: str
    category: Optional[str] = None

@router.get("/tasks", response_model=List[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    return db.query(AutomationTask).all()

@router.post("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int, 
    task_data: TaskBase, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db_task = db.query(AutomationTask).filter(AutomationTask.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    for key, value in task_data.model_dump().items():
        setattr(db_task, key, value)
        
    db.commit()
    db.refresh(db_task)
    return db_task

@router.post("/trigger")
async def trigger_task(
    request: TriggerRequest, 
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Logic to call n8n
    payload = {
        "action": "generate",
        "task_type": request.task_type,
        "category": request.category,
        "triggered_by": current_user.email,
        "timestamp": datetime.now().isoformat()
    }
    
    webhook_url = get_webhook_url(request.category)
    background_tasks.add_task(send_to_n8n, payload, webhook_url)
    
    return {"message": f"Tarea '{request.task_type}' ({request.category or 'general'}) disparada correctamente."}

async def send_to_n8n(payload: dict, webhook_url: str):
    async with httpx.AsyncClient() as client:
        try:
            print(f"📡 Sending trigger to n8n ({payload.get('category')}): {webhook_url}")
            response = await client.post(webhook_url, json=payload, timeout=10.0)
            print(f"✅ n8n response: {response.status_code}")
        except Exception as e:
            print(f"❌ Error triggering n8n: {e}")
