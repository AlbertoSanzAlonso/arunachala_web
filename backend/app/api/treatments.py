from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import MassageType, TherapyType, User
from app.api.auth import get_current_user
from app.core.image_utils import save_upload_file, delete_file
import os

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

class TreatmentResponse(TreatmentBase):
    id: int

    class Config:
        from_attributes = True

# --- Massage Endpoints ---

@router.get("/massages", response_model=List[TreatmentResponse])
def get_massages(db: Session = Depends(get_db)):
    return db.query(MassageType).order_by(MassageType.name).all()

@router.post("/massages", response_model=TreatmentResponse)
def create_massage(
    name: str = Form(...),
    excerpt: str = Form(None),
    description: str = Form(None),
    benefits: str = Form(None),
    duration_min: int = Form(None),
    is_active: bool = Form(True),
    image: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
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
        image_url=image_url
    )
    db.add(db_massage)
    db.commit()
    db.refresh(db_massage)
    return db_massage

@router.put("/massages/{massage_id}", response_model=TreatmentResponse)
def update_massage(
    massage_id: int,
    name: str = Form(None),
    excerpt: str = Form(None),
    description: str = Form(None),
    benefits: str = Form(None),
    duration_min: int = Form(None),
    is_active: bool = Form(None),
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
    
    db.commit()
    db.refresh(db_massage)
    return db_massage

@router.delete("/massages/{massage_id}")
def delete_massage(
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
    
    db.delete(db_massage)
    db.commit()
    return {"message": "Massage deleted successfully"}

# --- Therapy Endpoints ---

@router.get("/therapies", response_model=List[TreatmentResponse])
def get_therapies(db: Session = Depends(get_db)):
    return db.query(TherapyType).order_by(TherapyType.name).all()

@router.post("/therapies", response_model=TreatmentResponse)
def create_therapy(
    name: str = Form(...),
    excerpt: str = Form(None),
    description: str = Form(None),
    benefits: str = Form(None),
    duration_min: int = Form(None),
    is_active: bool = Form(True),
    image: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
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
        image_url=image_url
    )
    db.add(db_therapy)
    db.commit()
    db.refresh(db_therapy)
    return db_therapy

@router.put("/therapies/{therapy_id}", response_model=TreatmentResponse)
def update_therapy(
    therapy_id: int,
    name: str = Form(None),
    excerpt: str = Form(None),
    description: str = Form(None),
    benefits: str = Form(None),
    duration_min: int = Form(None),
    is_active: bool = Form(None),
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
    
    db.commit()
    db.refresh(db_therapy)
    return db_therapy

@router.delete("/therapies/{therapy_id}")
def delete_therapy(
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
    
    db.delete(db_therapy)
    db.commit()
    return {"message": "Therapy deleted successfully"}
