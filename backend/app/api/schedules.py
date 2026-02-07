from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import ClassSchedule, User, Activity
import json
from datetime import datetime

from app.api.auth import get_current_user
from app.core.webhooks import notify_n8n_content_change

router = APIRouter(prefix="/api/schedules", tags=["schedules"])

# Schemas
class YogaClassBrief(BaseModel):
    id: int
    name: str
    color: str | None = None
    description: str | None = None
    age_range: str | None = None
    translations: dict | None = None

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

def check_schedule_overlap(db: Session, day: str, start: str, end: str, exclude_id: int = None):
    """
    Check if a new schedule overlaps with existing ones.
    Overlap exists if: (StartA < EndB) AND (EndA > StartB)
    """
    query = db.query(ClassSchedule).filter(
        ClassSchedule.day_of_week == day,
        ClassSchedule.is_active == True,
        ClassSchedule.start_time < end,
        ClassSchedule.end_time > start
    )
    
    if exclude_id:
        query = query.filter(ClassSchedule.id != exclude_id)
        
    return query.first()

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
    
    # Fetch Activities (courses) with schedules
    act_query = db.query(Activity).filter(Activity.type == 'curso')
    if active_only:
        act_query = act_query.filter(Activity.is_active == True)
    
    courses = act_query.all()
    
    # Convert query results to list to append courses
    result = [s for s in schedules]
    
    for course in courses:
        if not course.activity_data:
            continue
            
        data = course.activity_data
        # Handle case where JSON might be a string (though SQLAlchemy should handle it)
        if isinstance(data, str):
             try:
                 data = json.loads(data)
             except:
                 continue

        if not isinstance(data, dict):
            continue

        schedule_list = data.get('schedule', [])
        if not schedule_list:
            continue
            
        # Format date range for display
        date_info = "CURSO"
        if course.end_date:
            # Check if it's a datetime object or string (just in case)
            ed = course.end_date
            if isinstance(ed, str):
                try:
                    ed = datetime.fromisoformat(ed)
                except:
                    pass
            if hasattr(ed, 'strftime'):
                date_info = f"Hasta {ed.strftime('%d/%m')}"
            
        for i, item in enumerate(schedule_list):
            day = item.get('day')
            time = item.get('time')
            try:
                duration = int(item.get('duration', 60))
            except:
                duration = 60
            
            if not day or not time:
                continue
                
            # Calculate end time
            try:
                h, m = map(int, time.split(':'))
                end_min = h * 60 + m + duration
                end_h = (end_min // 60) % 24
                end_m = end_min % 60
                end_time = f"{end_h:02d}:{end_m:02d}"
            except:
                continue
            
            # Mock YogaClassBrief
            # We use a negative ID to indicate it's not a real YogaClass record
            mock_class = YogaClassBrief(
                id=-course.id, 
                name=course.title,
                description=course.description,
                color="bg-blue-100 border-blue-300 text-blue-900",
                age_range=date_info, # Display end date here
                translations=course.translations
            )
            
            # Mock ScheduleResponse
            mock_schedule = ScheduleResponse(
                id=-(course.id * 1000 + i), # Unique negative ID
                class_id=-course.id,
                class_name=course.title,
                day_of_week=day,
                start_time=time,
                end_time=end_time,
                is_active=True,
                yoga_class=mock_class
            )
            
            result.append(mock_schedule)

    return result

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
async def create_schedule(
    schedule_data: ScheduleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new class schedule (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check for overlap
    overlap = check_schedule_overlap(
        db, 
        schedule_data.day_of_week, 
        schedule_data.start_time, 
        schedule_data.end_time
    )
    
    if overlap:
        name = overlap.class_name
        if overlap.yoga_class:
            name = overlap.yoga_class.name
        
        raise HTTPException(
            status_code=400, 
            detail=f"Conflicto de horario: Ya existe la clase '{name or 'Sin nombre'}' de {overlap.start_time} a {overlap.end_time}."
        )

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
    
    if new_schedule.class_id:
        await notify_n8n_content_change(new_schedule.class_id, "yoga_class", "update", db=db)
    
    return new_schedule

@router.put("/{schedule_id}", response_model=ScheduleResponse)
async def update_schedule(
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
    
    # Prepare data for overlap check
    new_day = schedule_data.day_of_week or schedule.day_of_week
    new_start = schedule_data.start_time or schedule.start_time
    new_end = schedule_data.end_time or schedule.end_time
    
    overlap = check_schedule_overlap(db, new_day, new_start, new_end, exclude_id=schedule_id)
    if overlap:
        name = overlap.class_name
        if overlap.yoga_class:
            name = overlap.yoga_class.name
            
        raise HTTPException(
            status_code=400, 
            detail=f"Conflicto de horario: Ya existe la clase '{name or 'Sin nombre'}' de {overlap.start_time} a {overlap.end_time}."
        )
    
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
    
    if schedule.class_id:
        await notify_n8n_content_change(schedule.class_id, "yoga_class", "update", db=db)
    
    return schedule

@router.delete("/{schedule_id}")
async def delete_schedule(
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
    
    class_id = schedule.class_id
    
    db.delete(schedule)
    db.commit()
    
    if class_id:
        await notify_n8n_content_change(class_id, "yoga_class", "update", db=db)
    
    return {"message": "Schedule deleted successfully"}

