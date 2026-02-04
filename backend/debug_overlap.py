from app.core.database import SessionLocal
from app.core.schedule_utils import check_global_overlap
from app.models.models import ClassSchedule

db = SessionLocal()

# 1. Print existing schedules days
schedules = db.query(ClassSchedule).all()
print("Existing Schedules Days:", set(s.day_of_week for s in schedules))

# 2. Check overlap for 'Lunes' at 19:15-20:45 (Example)
# Adjust these values to what the user might be trying
overlap = check_global_overlap(db, "Lunes", "19:15", "20:45")
print(f"Overlap Check Result: {overlap.exists} - {overlap.name}")
