from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import ClassSchedule, User
from app.api.auth import get_current_user

router = APIRouter(prefix="/api/schedules", tags=["schedules"])

# Schemas
class YogaClassBrief(BaseModel):
    id: int
    name: str
    color: str | None = None
    description: str | None = None
    intensity: str | None = None
    age_range: str | None = None

    class Config:
        from_attributes = True

class ScheduleBase(BaseModel):
    class_id: int | None = None
    class_name: str | None = None # Kept for migration
    day_of_week: str
    start_time: str
    end_time: str
    is_active: bool = True

class ScheduleCreate(ScheduleBase):
    pass

class ScheduleUpdate(BaseModel):
    class_id: int | None = None
    class_name: str | None = None
    day_of_week: str | None = None
    start_time: str | None = None
    end_time: str | None = None
    is_active: bool | None = None

class ScheduleResponse(ScheduleBase):
    id: int
    yoga_class: YogaClassBrief | None = None

    class Config:
        from_attributes = True

# Endpoints
@router.get("", response_model=List[ScheduleResponse])
def get_schedules(
    db: Session = Depends(get_db),
    active_only: bool = True
):
    """Get all class schedules"""
    query = db.query(ClassSchedule)
    if active_only:
        query = query.filter(ClassSchedule.is_active == True)
    schedules = query.order_by(ClassSchedule.day_of_week, ClassSchedule.start_time).all()
    return schedules

@router.get("/{schedule_id}", response_model=ScheduleResponse)
def get_schedule(
    schedule_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific schedule by ID"""
    schedule = db.query(ClassSchedule).filter(ClassSchedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule

@router.post("", response_model=ScheduleResponse)
def create_schedule(
    schedule_data: ScheduleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new class schedule (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    new_schedule = ClassSchedule(
        class_id=schedule_data.class_id,
        class_name=schedule_data.class_name,
        day_of_week=schedule_data.day_of_week,
        start_time=schedule_data.start_time,
        end_time=schedule_data.end_time,
        is_active=schedule_data.is_active
    )
    
    db.add(new_schedule)
    db.commit()
    db.refresh(new_schedule)
    
    return new_schedule

@router.put("/{schedule_id}", response_model=ScheduleResponse)
def update_schedule(
    schedule_id: int,
    schedule_data: ScheduleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a class schedule (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    schedule = db.query(ClassSchedule).filter(ClassSchedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    # Update fields
    if schedule_data.class_id is not None:
        schedule.class_id = schedule_data.class_id
    if schedule_data.class_name is not None:
        schedule.class_name = schedule_data.class_name
    if schedule_data.day_of_week is not None:
        schedule.day_of_week = schedule_data.day_of_week
    if schedule_data.start_time is not None:
        schedule.start_time = schedule_data.start_time
    if schedule_data.end_time is not None:
        schedule.end_time = schedule_data.end_time
    if schedule_data.is_active is not None:
        schedule.is_active = schedule_data.is_active
    
    db.commit()
    db.refresh(schedule)
    
    return schedule

@router.delete("/{schedule_id}")
def delete_schedule(
    schedule_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a class schedule (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    schedule = db.query(ClassSchedule).filter(ClassSchedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    db.delete(schedule)
    db.commit()
    
    return {"message": "Schedule deleted successfully"}

