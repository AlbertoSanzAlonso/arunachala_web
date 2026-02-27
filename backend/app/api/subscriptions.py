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

@router.get("/")
def get_subscriptions(db: Session = Depends(get_db)):
    """Admin endpoint to see subscribers"""
    return db.query(Subscription).all()

@router.delete("/{email}")
def unsubscribe(email: str, db: Session = Depends(get_db)):
    sub = db.query(Subscription).filter(Subscription.email == email).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    db.delete(sub)
    db.commit()
    return {"message": "Successfully unsubscribed and removed from our database"}
