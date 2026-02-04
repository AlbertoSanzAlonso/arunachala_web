from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.core.database import get_db, SessionLocal
from app.models.models import Activity, User
from app.api.auth import get_current_user
from app.core.image_utils import save_upload_file, delete_file
from app.core.webhooks import notify_n8n_content_change
from app.core.translation_utils import auto_translate_background
from app.core.schedule_utils import check_global_overlap
import json

router = APIRouter(prefix="/api/activities", tags=["activities"])

# Pydantic Schemas
class ActivityResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    translations: Optional[dict] = None
    type: str # 'curso', 'taller', 'evento', 'retiro', 'sugerencia'
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    location: Optional[str] = None
    price: Optional[str] = None
    image_url: Optional[str] = None
    activity_data: Optional[dict] = None
    slug: Optional[str] = None
    is_active: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Helper for validation
def validate_course_schedule(db: Session, activity_data_str: str | None, type: str, exclude_id: int = None):
    """
    Validates that a course schedule doesn't overlap with existing classes or courses.
    Raises HTTPException(400) if overlap is detected.
    """
    if type != 'curso' or not activity_data_str:
        return

    try:
        data = json.loads(activity_data_str)
    except json.JSONDecodeError:
        # Invalid JSON, will fail later in the flow
        return
    
    if 'schedule' not in data or not isinstance(data['schedule'], list):
        return
    
    for session in data['schedule']:
        day = session.get('day')
        time = session.get('time')
        
        # Safely handle duration, default to 60 if missing or invalid
        try:
            duration = int(session.get('duration', 60))
        except (ValueError, TypeError):
            duration = 60
        
        if not day or not time:
            continue
        
        # Calculate end time
        try:
            h, m = map(int, time.split(':'))
        except (ValueError, AttributeError):
            # Invalid time format, skip this session
            continue
            
        total_min = h * 60 + m + duration
        end_h = (total_min // 60) % 24
        end_m = total_min % 60
        end_time = f"{end_h:02d}:{end_m:02d}"

        # Check for overlap - this will raise HTTPException if found
        overlap = check_global_overlap(
            db, day, time, end_time, 
            exclude_type='activity', 
            exclude_id=exclude_id
        )
        
        if overlap.exists:
            raise HTTPException(
                status_code=400, 
                detail=f"Conflicto de horario: Ya existe '{overlap.name}' el {day} de {overlap.start} a {overlap.end}."
            )

@router.get("", response_model=List[ActivityResponse])
def get_activities(db: Session = Depends(get_db), active_only: bool = True):
    query = db.query(Activity)
    if active_only:
        query = query.filter(Activity.is_active == True)
    return query.order_by(Activity.start_date.asc().nulls_last(), Activity.created_at.desc()).all()

@router.get("/{activity_id}", response_model=ActivityResponse)
def get_activity(activity_id: int, db: Session = Depends(get_db)):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity

@router.post("", response_model=ActivityResponse)
async def create_activity(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    description: str = Form(None),
    translations: str = Form(None),
    activity_data: str = Form(None),
    type: str = Form(...),
    start_date: str = Form(None),
    end_date: str = Form(None),
    location: str = Form(None),
    price: str = Form(None),
    slug: str = Form(None),
    image: UploadFile = File(None),
    is_active: bool = Form(True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Validate overlap for courses
    validate_course_schedule(db, activity_data, type)

    image_url = None
    if image:
        image_url = save_upload_file(image, subdirectory="gallery/activities")

    # Handle dates
    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date) if end_date else None

    new_activity = Activity(
        title=title,
        description=description,
        translations=json.loads(translations) if translations else None,
        activity_data=json.loads(activity_data) if activity_data else None,
        type=type,
        start_date=start_dt,
        end_date=end_dt,
        location=location,
        price=price,
        image_url=image_url,
        slug=slug,
        is_active=is_active
    )
    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)
    
    # Notify RAG system (n8n)
    await notify_n8n_content_change(new_activity.id, "activity", "create", db=db)
    
    # Auto-translate if no translations provided
    if not translations and background_tasks:
        fields = {"title": title, "description": description} if description else {"title": title}
        background_tasks.add_task(
            auto_translate_background, 
            SessionLocal, 
            Activity, 
            new_activity.id, 
            fields
        )
    
    return new_activity

@router.put("/{activity_id}", response_model=ActivityResponse)
async def update_activity(
    activity_id: int,
    background_tasks: BackgroundTasks,
    title: str = Form(None),
    description: str = Form(None),
    translations: str = Form(None),
    activity_data: str = Form(None),
    type: str = Form(None),
    start_date: str = Form(None),
    end_date: str = Form(None),
    location: str = Form(None),
    price: str = Form(None),
    slug: str = Form(None),
    is_active: bool = Form(None),
    image: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    # Validate overlap if modifying course data or type
    check_type = type if type else activity.type
    check_data = activity_data if activity_data else (json.dumps(activity.activity_data) if activity.activity_data else None)
    
    validate_course_schedule(db, check_data, check_type, exclude_id=activity_id)
    
    if image:
        if activity.image_url:
            delete_file(activity.image_url)
        activity.image_url = save_upload_file(image, subdirectory="gallery/activities")

    if title is not None: activity.title = title
    if description is not None: activity.description = description
    if translations is not None: activity.translations = json.loads(translations) if translations else None
    if activity_data is not None: activity.activity_data = json.loads(activity_data) if activity_data else None
    if type is not None: activity.type = type
    if start_date is not None: activity.start_date = datetime.fromisoformat(start_date) if start_date else None
    if end_date is not None: activity.end_date = datetime.fromisoformat(end_date) if end_date else None
    if location is not None: activity.location = location
    if price is not None: activity.price = price
    if slug is not None: activity.slug = slug
    if is_active is not None: activity.is_active = is_active
    
    db.commit()
    db.refresh(activity)
    
    # Notify RAG system (n8n)
    await notify_n8n_content_change(activity.id, "activity", "update", db=db)
    
    # Re-translate if main fields changed and no new translations provided
    if (title or description) and not translations:
        fields = {"title": activity.title, "description": activity.description}
        fields = {k: v for k, v in fields.items() if v}
        background_tasks.add_task(
            auto_translate_background, 
            SessionLocal, 
            Activity, 
            activity.id, 
            fields
        )

    return activity

@router.delete("/{activity_id}")
async def delete_activity(
    activity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    if activity.image_url:
        delete_file(activity.image_url)

    # Notify RAG system BEFORE deleting
    await notify_n8n_content_change(activity_id, "activity", "delete", db=db)
    
    db.delete(activity)
    db.commit()
    
    return {"message": "Activity deleted successfully"}
