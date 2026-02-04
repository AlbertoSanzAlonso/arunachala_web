from sqlalchemy.orm import Session
from app.models.models import ClassSchedule, Activity
from datetime import datetime

class OverlapResult:
    def __init__(self, exists: bool, name: str, start: str, end: str):
        self.exists = exists
        self.name = name
        self.start = start
        self.end = end

def time_to_min(t_str: str) -> int:
    h, m = map(int, t_str.split(':'))
    return h * 60 + m

def check_global_overlap(db: Session, day: str, start_time: str, end_time: str, exclude_type: str = None, exclude_id: int = None) -> OverlapResult:
    """
    Checks for overlap against:
    1. Standard ClassSchedules
    2. Active 'Course' Activities
    
    exclude_type: 'schedule' or 'activity' (to skip self validation)
    exclude_id: ID of the entity being updated
    """
    
    target_start = time_to_min(start_time)
    target_end = time_to_min(end_time)
    
    # 1. Check Class Schedules
    # Fetch all active schedules to handle day matching more robustly in Python
    # This avoids issues with 'lunes' vs 'Lunes' or trailing spaces
    all_schedules = db.query(ClassSchedule).filter(ClassSchedule.is_active == True).all()
    
    schedules = [
        s for s in all_schedules 
        if s.day_of_week and s.day_of_week.strip().lower() == day.strip().lower()
    ]
    
    for s in schedules:
        if exclude_type == 'schedule' and s.id == exclude_id:
            continue
            
        s_start = time_to_min(s.start_time)
        s_end = time_to_min(s.end_time)
        
        # Overlap logic: StartA < EndB && EndA > StartB
        if target_start < s_end and target_end > s_start:
            name = s.class_name
            if s.yoga_class:
                name = s.yoga_class.name
            return OverlapResult(True, f"Clase: {name}", s.start_time, s.end_time)

    # 2. Check Course Activities
    courses = db.query(Activity).filter(
        Activity.type == 'curso',
        Activity.is_active == True
    ).all()
    
    for course in courses:
        if exclude_type == 'activity' and course.id == exclude_id:
            continue
            
        if not course.activity_data or 'schedule' not in course.activity_data:
            continue
            
        for session in course.activity_data['schedule']:
            if not session.get('day'):
                continue
                
            # Similar robust check for course days
            if session.get('day').strip().lower() != day.strip().lower():
                continue
                
            c_start_str = session.get('time')
            duration = session.get('duration', 60)
            
            c_start = time_to_min(c_start_str)
            c_end = c_start + duration
            
            # Convert c_end back to string for reporting
            ce_h = (c_end // 60) % 24
            ce_m = c_end % 60
            c_end_str = f"{ce_h:02d}:{ce_m:02d}"
            
            if target_start < c_end and target_end > c_start:
                return OverlapResult(True, f"Curso: {course.title}", c_start_str, c_end_str)
                
    return OverlapResult(False, "", "", "")
