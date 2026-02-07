
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from app.models.models import Content, YogaClassDefinition, MassageType, TherapyType, Activity

def count_active(db, Model, entity_type=None):
    query = db.query(Model)
    if hasattr(Model, 'is_active'):
        query = query.filter(Model.is_active == True)
    elif hasattr(Model, 'status'):
        query = query.filter(Model.status == 'published')
    
    if entity_type and hasattr(Model, 'type'):
        query = query.filter(Model.type == entity_type)
    return query.count()

db = SessionLocal()
try:
    meditations = count_active(db, Content, 'meditation')
    articles = count_active(db, Content, 'article')
    yoga = count_active(db, YogaClassDefinition)
    massage = count_active(db, MassageType)
    therapy = count_active(db, TherapyType)
    activity = count_active(db, Activity)
    
    print(f"Meditations (Published): {meditations}")
    print(f"Articles (Published): {articles}")
    print(f"Yoga: {yoga}")
    print(f"Massage: {massage}")
    print(f"Therapy: {therapy}")
    print(f"Activity: {activity}")
    
    # Check all meditations regardless of status
    all_meditations = db.query(Content).filter(Content.type == 'meditation').count()
    print(f"All Meditations (Any status): {all_meditations}")
    
finally:
    db.close()
