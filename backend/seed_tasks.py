from app.core.database import SessionLocal
from app.models.models import AutomationTask

def seed_automation_tasks():
    db = SessionLocal()
    tasks = [
        {
            "name": "Generar artículo de Yoga",
            "task_type": "generate_article",
            "category": "yoga",
            "schedule_type": "weekly",
            "schedule_days": "1", # Lunes
            "schedule_time": "09:00",
            "is_active": False
        },
        {
            "name": "Generar artículo de Terapias",
            "task_type": "generate_article",
            "category": "therapy",
            "schedule_type": "weekly",
            "schedule_days": "4", # Jueves
            "schedule_time": "09:00",
            "is_active": False
        }
    ]

    for task_data in tasks:
        existing = db.query(AutomationTask).filter(
            AutomationTask.task_type == task_data["task_type"],
            AutomationTask.category == task_data["category"]
        ).first()
        
        if not existing:
            task = AutomationTask(**task_data)
            db.add(task)
            print(f"✅ Created task: {task_data['name']}")
    
    db.commit()
    db.close()

if __name__ == "__main__":
    seed_automation_tasks()
