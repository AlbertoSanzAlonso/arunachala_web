from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import ClassSchedule, User, Activity
from app.api.auth import get_current_user
from app.core.webhooks import notify_n8n_content_change
from app.core.schedule_utils import check_global_overlap

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
    is_course: bool = False
    course_type: str | None = None # 'curso', 'taller' etc

    class Config:
        from_attributes = True

# Endpoints
@router.get("", response_model=List[ScheduleResponse])
def get_schedules(
    db: Session = Depends(get_db),
    active_only: bool = True
):
    """Get all class schedules (including Courses)"""
    response_items = []

    # 1. Standard Classes
    query = db.query(ClassSchedule)
    if active_only:
        query = query.filter(ClassSchedule.is_active == True)
    
    # Sort logic helpers
    days_map = {
        "Lunes": 0, "Martes": 1, "Miércoles": 2, "Jueves": 3, 
        "Viernes": 4, "Sábado": 5, "Domingo": 6
    }
    
    schedules = query.all()
    
    for s in schedules:
        # Convert SQLAlchemy model to Pydantic compatible dict/object
        # The response_model handles the conversion from the ORM object automatically 
        # but since we are mixing types, let's let Pydantic do its job later by returning a list of objects options
        # However, to mix them in a single list, they need to verify against `ScheduleResponse`
        response_items.append(ScheduleResponse.from_orm(s))

    # 2. Courses (Activity type='curso')
    activities_query = db.query(Activity).filter(Activity.type == 'curso')
    if active_only:
        activities_query = activities_query.filter(Activity.is_active == True)
        
    courses = activities_query.all()
    
    for course in courses:
        if not course.activity_data or 'schedule' not in course.activity_data:
            continue
            
        sessions = course.activity_data['schedule'] # [{day, time, duration}]
        if not isinstance(sessions, list):
            continue

        for idx, session in enumerate(sessions):
            if 'day' not in session or 'time' not in session:
                continue

            # Calculate end_time
            try:
                h, m = map(int, session['time'].split(':'))
                duration = int(session.get('duration', 60))
                total_min = h * 60 + m + duration
                end_h = (total_min // 60) % 24
                end_m = total_min % 60
                end_time = f"{end_h:02d}:{end_m:02d}"
            except:
                continue
            
            # Generate a consistent negative ID to avoid collision with real DB IDs
            fake_id = - (course.id * 1000 + idx)
            
            # Specific styling for courses
            course_color = "bg-primary-50 border-primary-300 text-primary-900 border-l-4" 
            
            brief = YogaClassBrief(
                id=0, # Dummy ID
                name=course.title,
                color=course_color,
                description=course.description,
                age_range="CURSO", # Badge
                translations=course.translations
            )
            
            item = ScheduleResponse(
                id=fake_id,
                class_id=None,
                class_name=course.title,
                day_of_week=session['day'],
                start_time=session['time'],
                end_time=end_time,
                is_active=course.is_active,
                is_course=True,
                course_type=course.type,
                yoga_class=brief
            )
            response_items.append(item)
            
    # Sort primarily by Day, then by Start Time
    def sort_key(item):
        day_idx = days_map.get(item.day_of_week, 7)
        return (day_idx, item.start_time)

    response_items.sort(key=sort_key)
    return response_items

@router.get("/{schedule_id}", response_model=ScheduleResponse)
def get_schedule(
    schedule_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific schedule by ID"""
    if schedule_id < 0:
        # It's a virtual course schedule, we can't really "get" it individually by ID easily
        # unless we parse the ID logic. For now, deny.
        raise HTTPException(status_code=404, detail="Virtual schedules cannot be fetched individually")

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
    overlap = check_global_overlap(
        db, 
        schedule_data.day_of_week, 
        schedule_data.start_time, 
        schedule_data.end_time,
        exclude_type='schedule'
    )
    
    if overlap.exists:
        raise HTTPException(
            status_code=400, 
            detail=f"Conflicto de horario: Ya existe '{overlap.name}' de {overlap.start} a {overlap.end}."
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
        await notify_n8n_content_change(new_schedule.class_id, "yoga_class", "update")
    
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
    
    overlap = check_global_overlap(
        db, 
        new_day, new_start, new_end, 
        exclude_type='schedule', 
        exclude_id=schedule_id
    )
    
    if overlap.exists:
        raise HTTPException(
            status_code=400, 
            detail=f"Conflicto de horario: Ya existe '{overlap.name}' de {overlap.start} a {overlap.end}."
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
        await notify_n8n_content_change(schedule.class_id, "yoga_class", "update")
    
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
        await notify_n8n_content_change(class_id, "yoga_class", "update")
    
    return {"message": "Schedule deleted successfully"}
