from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import YogaClassDefinition, User
from app.api.auth import get_current_user

router = APIRouter(prefix="/api/yoga-classes", tags=["yoga-classes"])

class YogaClassBase(BaseModel):
    name: str
    description: str | None = None
    color: str | None = None
    age_range: str | None = None

class YogaClassCreate(YogaClassBase):
    pass

class YogaClassUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    color: str | None = None
    age_range: str | None = None

class YogaClassResponse(YogaClassBase):
    id: int

    class Config:
        from_attributes = True

@router.get("", response_model=List[YogaClassResponse])
def get_yoga_classes(db: Session = Depends(get_db)):
    return db.query(YogaClassDefinition).order_by(YogaClassDefinition.name).all()

@router.post("", response_model=YogaClassResponse)
def create_yoga_class(
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
    return db_class

@router.put("/{class_id}", response_model=YogaClassResponse)
def update_yoga_class(
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
    return db_class

@router.delete("/{class_id}")
def delete_yoga_class(
    class_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_class = db.query(YogaClassDefinition).filter(YogaClassDefinition.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
    
    db.delete(db_class)
    db.commit()
    return {"message": "Class deleted successfully"}
