from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import YogaClassDefinition, User
from app.api.auth import get_current_user
from app.core.webhooks import notify_n8n_content_change

router = APIRouter(prefix="/api/yoga-classes", tags=["yoga-classes"])

class YogaClassBase(BaseModel):
    name: str
    description: str | None = None
    color: str | None = None
    age_range: str | None = None
    translations: dict | None = None

class YogaClassCreate(YogaClassBase):
    pass

class YogaClassUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    color: str | None = None
    age_range: str | None = None
    translations: dict | None = None

class ScheduleBrief(BaseModel):
    id: int
    day_of_week: str
    start_time: str
    end_time: str
    is_active: bool

    class Config:
        from_attributes = True

class YogaClassResponse(YogaClassBase):
    id: int
    schedules: List[ScheduleBrief] = []

    class Config:
        from_attributes = True

@router.get("", response_model=List[YogaClassResponse])
def get_yoga_classes(db: Session = Depends(get_db)):
    return db.query(YogaClassDefinition).order_by(YogaClassDefinition.name).all()

@router.get("/{class_id}", response_model=YogaClassResponse)
def get_yoga_class(class_id: int, db: Session = Depends(get_db)):
    db_class = db.query(YogaClassDefinition).filter(YogaClassDefinition.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
    return db_class

@router.post("", response_model=YogaClassResponse)
async def create_yoga_class(
    class_data: YogaClassCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_class = YogaClassDefinition(**class_data.model_dump())
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    
    # Notify n8n for RAG update
    await notify_n8n_content_change(db_class.id, "yoga_class", "create")
    
    return db_class

@router.put("/{class_id}", response_model=YogaClassResponse)
async def update_yoga_class(
    class_id: int,
    class_data: YogaClassUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_class = db.query(YogaClassDefinition).filter(YogaClassDefinition.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
    
    for key, value in class_data.model_dump(exclude_unset=True).items():
        setattr(db_class, key, value)
    
    db.commit()
    db.refresh(db_class)
    
    # Notify n8n for RAG update
    await notify_n8n_content_change(db_class.id, "yoga_class", "update")
    
    return db_class

@router.delete("/{class_id}")
async def delete_yoga_class(
    class_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_class = db.query(YogaClassDefinition).filter(YogaClassDefinition.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Notify n8n BEFORE delete for reference if needed, or just action
    await notify_n8n_content_change(db_class.id, "yoga_class", "delete")
    
    db.delete(db_class)
    db.commit()
    return {"message": "Class deleted successfully"}
