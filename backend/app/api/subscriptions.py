from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Subscription
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from app.services.email import email_service
from datetime import datetime

router = APIRouter(
    prefix="/api/subscriptions",
    tags=["subscriptions"]
)

class SubscriptionCreate(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    language: Optional[str] = 'es'

class SubscriptionResponse(BaseModel):
    id: int
    email: str
    first_name: Optional[str] = None
    language: str
    is_active: bool

    class Config:
        from_attributes = True

@router.post("/", response_model=SubscriptionResponse)
def subscribe(sub: SubscriptionCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Check if already exists
    existing = db.query(Subscription).filter(Subscription.email == sub.email).first()
    if existing:
        was_inactive = not existing.is_active
        if sub.first_name:
            existing.first_name = sub.first_name
        if sub.language:
            existing.language = sub.language
        if not existing.is_active:
            existing.is_active = True
        
        db.commit()
        db.refresh(existing)
        
        if was_inactive:
            background_tasks.add_task(
                email_service.send_welcome_email, 
                existing.email, 
                existing.first_name, 
                existing.language
            )
        return existing
    
    new_sub = Subscription(email=sub.email, first_name=sub.first_name, language=sub.language)
    db.add(new_sub)
    try:
        db.commit()
        db.refresh(new_sub)
        # Trigger welcome email in background
        background_tasks.add_task(
            email_service.send_welcome_email, 
            new_sub.email, 
            new_sub.first_name, 
            new_sub.language
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error creating subscription")
    
    db.refresh(new_sub)
    return new_sub

@router.get("/test-smtp-config")
async def test_smtp_config():
    """Debug endpoint to verify if SMTP vars are loaded in production."""
    from app.services.email import email_service
    return {
        "use_smtp": email_service.use_smtp,
        "mail_server_set": bool(email_service.mail_server),
        "mail_server_value": email_service.mail_server,
        "mail_user_set": bool(email_service.mail_username),
        "mail_port": email_service.mail_port,
        "mail_from": email_service.mail_from
    }

@router.get("/test-email-send-debug")
async def test_email_send_debug(email: str = "albertosanzdev@gmail.com"):
    """Debug endpoint to force synchronous email send and capture exact SMTP error."""
    try:
        from app.services.email import email_service
        # We will directly invoke the SMTP send to capture the exception without background tasks
        success = await email_service.send_welcome_email(email, "Test", "es")
        logo_url = f"{email_service.frontend_url}/logo_transparent.png"
        return {
            "success": success, 
            "message": "Check your email",
            "debug_info": {
                "frontend_url": email_service.frontend_url,
                "logo_url": logo_url
            }
        }
    except Exception as e:
        import traceback
        return {"success": False, "error": str(e), "traceback": traceback.format_exc()}

@router.delete("/{email}")
def unsubscribe(email: str, db: Session = Depends(get_db)):
    sub = db.query(Subscription).filter(Subscription.email == email).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    db.delete(sub)
    db.commit()
    return {"message": "Successfully unsubscribed and removed from our database"}
