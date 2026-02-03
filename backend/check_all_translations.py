import os
import json
from app.core.database import SessionLocal
from app.models.models import MassageType, TherapyType, Activity, Content, YogaClassDefinition

db = SessionLocal()

def check_model(model_class):
    print(f"\n--- {model_class.__name__} ---")
    items = db.query(model_class).all()
    for item in items:
        name_attr = 'name' if hasattr(item, 'name') else 'title'
        val = getattr(item, name_attr)
        print(f"ID: {item.id} | {name_attr.capitalize()}: {val}")
        print(f"Translations: {json.dumps(item.translations, indent=2) if item.translations else 'None'}")

check_model(MassageType)
check_model(TherapyType)
check_model(Activity)

db.close()
