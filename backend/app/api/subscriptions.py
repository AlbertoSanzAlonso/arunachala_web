from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Subscription
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from app.services.email import email_service
from datetime import datetime
import uuid

router = APIRouter(
    tags=["subscriptions"]
)

@router.get("/ping")
def ping_subscriptions():
    return {"status": "ok", "service": "subscriptions"}

class BulkDeleteRequest(BaseModel):
    emails: List[str]

class SendEmailRequest(BaseModel):
    emails: List[str]
    subject: str
    content: str

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
    is_confirmed: bool

    class Config:
        from_attributes = True

@router.post("/", response_model=SubscriptionResponse)
def subscribe(sub: SubscriptionCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Normalize email to lowercase
    email_low = sub.email.lower().strip()
    
    # Check if already exists (case-insensitive)
    existing = db.query(Subscription).filter(Subscription.email.ilike(email_low)).first()
    
    # Generate a new token anyway - will be used if creating new or if existing has none
    token = str(uuid.uuid4())
    print(f"DEBUG: Subscription attempt for {email_low}. New token generated: {token}")
    
    if existing:
        print(f"DEBUG: Found existing subscription for {email_low}. Current token: {existing.confirmation_token}, confirmed: {existing.is_confirmed}")
        if sub.first_name:
            existing.first_name = sub.first_name
        if sub.language:
            existing.language = sub.language
        
        # If already confirmed and active, just return
        if existing.is_confirmed and existing.is_active:
            print(f"DEBUG: Subscriber {email_low} already confirmed. Returning existing.")
            return existing
            
        # Re-use existing token if available to avoid invalidating previous emails
        if not existing.confirmation_token:
            existing.confirmation_token = token
            print(f"DEBUG: Existing subscriber {email_low} had no token. Set to {token}")
        else:
            token = existing.confirmation_token
            print(f"DEBUG: Re-using existing token {token} for {email_low}")
            
        # Ensure it is set as inactive until confirmed
        existing.is_active = False
        existing.is_confirmed = False
        
        db.commit()
        db.refresh(existing)
        
        print(f"DEBUG: Sending confirmation email to {existing.email} with token {token}")
        
        # Trigger confirmation email
        background_tasks.add_task(
            email_service.send_confirmation_email, 
            existing.email, 
            token,
            existing.first_name, 
            existing.language
        )
        return existing
    
    new_sub = Subscription(
        email=email_low, 
        first_name=sub.first_name, 
        language=sub.language or 'es',
        is_active=False,
        is_confirmed=False,
        confirmation_token=token
    )
    db.add(new_sub)
    try:
        db.commit()
        db.refresh(new_sub)
        print(f"DEBUG: Created new subscription for {email_low} with token {token}")
        # Trigger confirmation email in background
        background_tasks.add_task(
            email_service.send_confirmation_email, 
            new_sub.email, 
            token,
            new_sub.first_name, 
            new_sub.language
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error creating subscription")
    
    db.refresh(new_sub)
    return new_sub

@router.get("/confirm/{token}")
async def confirm_subscription_path(token: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Confirmation endpoint using path parameter"""
    return await _process_confirmation(token, background_tasks, db)

@router.get("/confirm")
async def confirm_subscription_query(token: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Confirmation endpoint using query parameter"""
    return await _process_confirmation(token, background_tasks, db)

async def _process_confirmation(token: str, background_tasks: BackgroundTasks, db: Session):
    if not token:
        raise HTTPException(status_code=400, detail="Token no proporcionado")
        
    sub = db.query(Subscription).filter(Subscription.confirmation_token == token).first()
    if not sub:
        print(f"DEBUG: Confirmation failed. Token {token} not found in database.")
        raise HTTPException(status_code=404, detail="Token de confirmación no válido o expirado")
    
    print(f"DEBUG: Found subscriber {sub.email} for token {token}. Confirmed: {sub.is_confirmed}")
    
    if sub.is_confirmed:
        return {"message": "Tu suscripción ya estaba confirmada. ¡Gracias!", "status": "already_confirmed"}
        
    sub.is_confirmed = True
    sub.is_active = True
    
    # Store needed info before commit just in case
    email = sub.email
    first_name = sub.first_name
    language = sub.language
    
    db.commit()
    
    # Send welcome email now that it's confirmed
    background_tasks.add_task(
        email_service.send_welcome_email,
        email,
        first_name,
        language
    )
    
    return {"message": "Suscripción confirmada correctamente. ¡Bienvenido/a!", "status": "success"}

@router.get("/")
def get_subscriptions(confirmed_only: bool = False, db: Session = Depends(get_db)):
    """Admin endpoint to see subscribers"""
    query = db.query(Subscription)
    if confirmed_only:
        query = query.filter(Subscription.is_confirmed == True)
    return query.all()

@router.delete("/{email}")
def unsubscribe(email: str, db: Session = Depends(get_db)):
    sub = db.query(Subscription).filter(Subscription.email == email).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    db.delete(sub)
    db.commit()
    return {"message": "Successfully unsubscribed and removed from our database"}

@router.post("/bulk-delete")
def bulk_delete(req: BulkDeleteRequest, db: Session = Depends(get_db)):
    """Admin endpoint to bulk delete subscribers"""
    # Assuming this endpoint is protected or only used by admin (should enforce role later but keep it simple for now as everything is protected behind dashboard)
    deleted = db.query(Subscription).filter(Subscription.email.in_(req.emails)).delete(synchronize_session=False)
    db.commit()
    return {"message": f"Successfully deleted {deleted} subscriptions"}

@router.post("/send-email")
def send_custom_email_endpoint(req: SendEmailRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Admin endpoint to send a custom email down to subscribers"""
    # Filter only confirmed and active subscribers
    subs = db.query(Subscription).filter(
        Subscription.email.in_(req.emails),
        Subscription.is_confirmed == True,
        Subscription.is_active == True
    ).all()
    
    if not subs:
        raise HTTPException(
            status_code=404, 
            detail="No se han encontrado suscriptores confirmados entre los seleccionados."
        )

    recipients = [
        {"email": sub.email, "first_name": sub.first_name, "language": sub.language}
        for sub in subs
    ]

    background_tasks.add_task(
        email_service.send_custom_email,
        recipients,
        req.subject,
        req.content
    )
    
    return {"message": "Email is being sent in the background"}
