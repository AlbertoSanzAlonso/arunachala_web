from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import YogaClassDefinition, User, DashboardActivity
from app.api.auth import get_current_user
from app.core.webhooks import notify_n8n_content_change
from app.core.translation_utils import auto_translate_background
from app.core.database import get_db, SessionLocal
from fastapi import BackgroundTasks

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
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    data = class_data.model_dump()
    if 'description' in data and data['description'] is None:
        data['description'] = ""
    
    db_class = YogaClassDefinition(**data)
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    
    # Notify n8n for RAG update
    background_tasks.add_task(notify_n8n_content_change, db_class.id, "yoga_class", "create", db=None)
    
    # Log to dashboard activity
    activity_log = DashboardActivity(
        type='yoga_class',
        action='created',
        title=f"Nueva clase de yoga: {db_class.name}",
        entity_id=db_class.id
    )
    db.add(activity_log)
    db.commit()
    
    # Auto-translate if no translations provided
    if not class_data.translations and background_tasks:
        fields = {
            "name": class_data.name, 
            "description": class_data.description,
            "age_range": class_data.age_range
        }
        fields = {k: v for k, v in fields.items() if v}
        background_tasks.add_task(
            auto_translate_background, 
            SessionLocal, 
            YogaClassDefinition, 
            db_class.id, 
            fields
        )
    
    return db_class

@router.put("/{class_id}", response_model=YogaClassResponse)
async def update_yoga_class(
    class_id: int,
    class_data: YogaClassUpdate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_class = db.query(YogaClassDefinition).filter(YogaClassDefinition.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Capture original text fields to avoid unnecessary translations
    original_name = db_class.name
    original_description = db_class.description
    original_age_range = db_class.age_range

    update_data = class_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_class, key, value)
    
    # Sync name in associated schedules if name changed
    if db_class.name != original_name:
        from app.models.models import ClassSchedule
        db.query(ClassSchedule).filter(ClassSchedule.class_id == db_class.id).update(
            {ClassSchedule.class_name: db_class.name}
        )
    
    db.commit()
    db.refresh(db_class)
    
    # Also notify RAG that associated content might have changed (since name is embedded)
    background_tasks.add_task(notify_n8n_content_change, db_class.id, "yoga_class", "update", db=None)

    # Re-translate if main fields changed and no new translations provided
    needs_translation = False
    if db_class.name != original_name: needs_translation = True
    if db_class.description != original_description: needs_translation = True
    if db_class.age_range != original_age_range: needs_translation = True

    if needs_translation:
        # Keep empty strings to ensure stale translations are cleared
        fields = {
            "name": db_class.name, 
            "description": db_class.description,
            "age_range": db_class.age_range
        }
        fields = {k: v for k, v in fields.items() if v is not None}
        print(f"🔄 QUEUEING TRANSLATION for YogaClass #{db_class.id} (fields: {list(fields.keys())})")
        background_tasks.add_task(
            auto_translate_background, 
            SessionLocal, 
            YogaClassDefinition, 
            db_class.id, 
            fields
        )
    
    return db_class

@router.delete("/{class_id}")
async def delete_yoga_class(
    class_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_class = db.query(YogaClassDefinition).filter(YogaClassDefinition.id == class_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Notify n8n for RAG update
    background_tasks.add_task(notify_n8n_content_change, db_class.id, "yoga_class", "delete", db=None, entity=db_class)
    
    # Log to dashboard activity
    activity_log = DashboardActivity(
        type='yoga_class',
        action='deleted',
        title=db_class.name,
        entity_id=class_id
    )
    db.add(activity_log)

    db.delete(db_class)
    db.commit()
    return {"message": "Class deleted successfully"}
