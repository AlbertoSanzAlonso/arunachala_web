from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import MassageType, TherapyType, User
from app.api.auth import get_current_user
from app.core.image_utils import save_upload_file, delete_file
from app.core.webhooks import notify_n8n_content_change
from app.core.translation_utils import auto_translate_background
from app.core.database import get_db, SessionLocal
from fastapi import BackgroundTasks
import os
import json

router = APIRouter(prefix="/api/treatments", tags=["treatments"])

# Pydantic Schemas
class TreatmentBase(BaseModel):
    name: str
    excerpt: Optional[str] = None
    description: Optional[str] = None
    benefits: Optional[str] = None
    duration_min: Optional[int] = None
    image_url: Optional[str] = None
    is_active: bool = True
    translations: Optional[dict] = None

class TreatmentCreate(TreatmentBase):
    pass

class TreatmentUpdate(BaseModel):
    name: Optional[str] = None
    excerpt: Optional[str] = None
    description: Optional[str] = None
    benefits: Optional[str] = None
    duration_min: Optional[int] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    translations: Optional[dict] = None

class TreatmentResponse(TreatmentBase):
    id: int

    class Config:
        from_attributes = True

# --- Massage Endpoints ---

@router.get("/massages", response_model=List[TreatmentResponse])
def get_massages(db: Session = Depends(get_db)):
    return db.query(MassageType).order_by(MassageType.name).all()

@router.get("/massages/{massage_id}", response_model=TreatmentResponse)
def get_massage(massage_id: int, db: Session = Depends(get_db)):
    db_massage = db.query(MassageType).filter(MassageType.id == massage_id).first()
    if not db_massage:
        raise HTTPException(status_code=404, detail="Massage not found")
    return db_massage

@router.post("/massages", response_model=TreatmentResponse)
async def create_massage(
    background_tasks: BackgroundTasks,
    name: str = Form(...),
    excerpt: str = Form(None),
    description: str = Form(None),
    benefits: str = Form(None),
    duration_min: int = Form(None),
    is_active: bool = Form(True),
    translations: str = Form(None),
    image: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if massage with same name already exists
    existing = db.query(MassageType).filter(MassageType.name == name).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Un masaje con el nombre '{name}' ya existe")
    
    image_url = None
    if image:
        image_url = save_upload_file(image, subdirectory="treatments/massages")

    if duration_min == 0:
        duration_min = None

    db_massage = MassageType(
        name=name,
        excerpt=excerpt,
        description=description,
        benefits=benefits,
        duration_min=duration_min,
        is_active=is_active,
        image_url=image_url,
        translations=json.loads(translations) if translations else None
    )
    
    try:
        db.add(db_massage)
        db.commit()
        db.refresh(db_massage)
    except Exception as e:
        db.rollback()
        # Delete uploaded image if commit failed
        if image_url:
            delete_file(image_url)
        raise HTTPException(status_code=400, detail=f"Error al crear el masaje: {str(e)}")
    
    # Notify n8n for RAG update
    await notify_n8n_content_change(db_massage.id, "massage", "create", db=db)
    
    # Auto-translate if no translations provided
    if not translations and background_tasks:
        fields = {"name": name, "excerpt": excerpt, "description": description, "benefits": benefits}
        # Clean None values
        fields = {k: v for k, v in fields.items() if v}
        background_tasks.add_task(
            auto_translate_background, 
            SessionLocal, 
            MassageType, 
            db_massage.id, 
            fields
        )
    
    return db_massage

@router.put("/massages/{massage_id}", response_model=TreatmentResponse)
async def update_massage(
    massage_id: int,
    background_tasks: BackgroundTasks,
    name: str = Form(None),
    excerpt: str = Form(None),
    description: str = Form(None),
    benefits: str = Form(None),
    duration_min: int = Form(None),
    is_active: bool = Form(None),
    translations: str = Form(None),
    image: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_massage = db.query(MassageType).filter(MassageType.id == massage_id).first()
    if not db_massage:
        raise HTTPException(status_code=404, detail="Massage not found")
    
    if image:
        # Delete old image if exists
        if db_massage.image_url:
            delete_file(db_massage.image_url)
            
        # Save new image and update URL
        db_massage.image_url = save_upload_file(image, subdirectory="treatments/massages")

    # Update other fields if provided
    if name is not None: db_massage.name = name
    if excerpt is not None: db_massage.excerpt = excerpt
    if description is not None: db_massage.description = description
    if benefits is not None: db_massage.benefits = benefits
    if duration_min is not None: 
        db_massage.duration_min = None if duration_min == 0 else duration_min
    if is_active is not None: db_massage.is_active = is_active
    if translations is not None: db_massage.translations = json.loads(translations) if translations else None
    
    db.commit()
    db.refresh(db_massage)
    
    # Notify n8n for RAG update
    await notify_n8n_content_change(db_massage.id, "massage", "update", db=db)
    
    # Re-translate if fields changed and no new translations provided
    if (name or excerpt or description or benefits) and not translations:
        fields = {"name": db_massage.name, "excerpt": db_massage.excerpt, "description": db_massage.description, "benefits": db_massage.benefits}
        fields = {k: v for k, v in fields.items() if v}
        background_tasks.add_task(
            auto_translate_background, 
            SessionLocal, 
            MassageType, 
            db_massage.id, 
            fields
        )
    
    return db_massage

@router.delete("/massages/{massage_id}")
async def delete_massage(
    massage_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_massage = db.query(MassageType).filter(MassageType.id == massage_id).first()
    if not db_massage:
        raise HTTPException(status_code=404, detail="Massage not found")
    
    # Delete file from disk
    if db_massage.image_url:
        delete_file(db_massage.image_url)
    
    # Notify n8n
    await notify_n8n_content_change(db_massage.id, "massage", "delete", db=db)
    
    db.delete(db_massage)
    db.commit()
    return {"message": "Massage deleted successfully"}

# --- Therapy Endpoints ---

@router.get("/therapies", response_model=List[TreatmentResponse])
def get_therapies(db: Session = Depends(get_db)):
    return db.query(TherapyType).order_by(TherapyType.name).all()

@router.get("/therapies/{therapy_id}", response_model=TreatmentResponse)
def get_therapy(therapy_id: int, db: Session = Depends(get_db)):
    db_therapy = db.query(TherapyType).filter(TherapyType.id == therapy_id).first()
    if not db_therapy:
        raise HTTPException(status_code=404, detail="Therapy not found")
    return db_therapy

@router.post("/therapies", response_model=TreatmentResponse)
async def create_therapy(
    background_tasks: BackgroundTasks,
    name: str = Form(...),
    excerpt: str = Form(None),
    description: str = Form(None),
    benefits: str = Form(None),
    duration_min: int = Form(None),
    is_active: bool = Form(True),
    translations: str = Form(None),
    image: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if therapy with same name already exists
    existing = db.query(TherapyType).filter(TherapyType.name == name).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Una terapia con el nombre '{name}' ya existe")
    
    image_url = None
    if image:
        image_url = save_upload_file(image, subdirectory="treatments/therapies")

    if duration_min == 0:
        duration_min = None

    db_therapy = TherapyType(
        name=name,
        excerpt=excerpt,
        description=description,
        benefits=benefits,
        duration_min=duration_min,
        is_active=is_active,
        image_url=image_url,
        translations=json.loads(translations) if translations else None
    )
    
    try:
        db.add(db_therapy)
        db.commit()
        db.refresh(db_therapy)
    except Exception as e:
        db.rollback()
        # Delete uploaded image if commit failed
        if image_url:
            delete_file(image_url)
        raise HTTPException(status_code=400, detail=f"Error al crear la terapia: {str(e)}")
    
    # Notify n8n for RAG update
    await notify_n8n_content_change(db_therapy.id, "therapy", "create", db=db)
    
    # Auto-translate if no translations provided
    if not translations and background_tasks:
        fields = {"name": name, "excerpt": excerpt, "description": description, "benefits": benefits}
        # Clean None values
        fields = {k: v for k, v in fields.items() if v}
        background_tasks.add_task(
            auto_translate_background, 
            SessionLocal, 
            TherapyType, 
            db_therapy.id, 
            fields
        )
    
    return db_therapy

@router.put("/therapies/{therapy_id}", response_model=TreatmentResponse)
async def update_therapy(
    therapy_id: int,
    background_tasks: BackgroundTasks,
    name: str = Form(None),
    excerpt: str = Form(None),
    description: str = Form(None),
    benefits: str = Form(None),
    duration_min: int = Form(None),
    is_active: bool = Form(None),
    translations: str = Form(None),
    image: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_therapy = db.query(TherapyType).filter(TherapyType.id == therapy_id).first()
    if not db_therapy:
        raise HTTPException(status_code=404, detail="Therapy not found")
    
    if image:
        # Delete old image if exists
        if db_therapy.image_url:
            delete_file(db_therapy.image_url)
            
        # Save new image and update URL
        db_therapy.image_url = save_upload_file(image, subdirectory="treatments/therapies")

    if name is not None: db_therapy.name = name
    if excerpt is not None: db_therapy.excerpt = excerpt
    if description is not None: db_therapy.description = description
    if benefits is not None: db_therapy.benefits = benefits
    if duration_min is not None: 
        db_therapy.duration_min = None if duration_min == 0 else duration_min
    if is_active is not None: db_therapy.is_active = is_active
    if translations is not None: db_therapy.translations = json.loads(translations) if translations else None
    
    db.commit()
    db.refresh(db_therapy)
    
    # Notify n8n for RAG update
    await notify_n8n_content_change(db_therapy.id, "therapy", "update", db=db)
    
    # Re-translate if fields changed and no new translations provided
    if (name or excerpt or description or benefits) and not translations:
        fields = {"name": db_therapy.name, "excerpt": db_therapy.excerpt, "description": db_therapy.description, "benefits": db_therapy.benefits}
        fields = {k: v for k, v in fields.items() if v}
        background_tasks.add_task(
            auto_translate_background, 
            SessionLocal, 
            TherapyType, 
            db_therapy.id, 
            fields
        )
    
    return db_therapy

@router.delete("/therapies/{therapy_id}")
async def delete_therapy(
    therapy_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_therapy = db.query(TherapyType).filter(TherapyType.id == therapy_id).first()
    if not db_therapy:
        raise HTTPException(status_code=404, detail="Therapy not found")
    
    # Delete file from disk
    if db_therapy.image_url:
        delete_file(db_therapy.image_url)
    
    # Notify n8n
    await notify_n8n_content_change(db_therapy.id, "therapy", "delete", db=db)
    
    db.delete(db_therapy)
    db.commit()
    return {"message": "Therapy deleted successfully"}
