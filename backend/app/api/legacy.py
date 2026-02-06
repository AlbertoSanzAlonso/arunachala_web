from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Content, MassageType, TherapyType, YogaClassDefinition, Activity

router = APIRouter(prefix="/api", tags=["compatibility"])

@router.get("/article/{id}")
def get_article_legacy_resolver(id: int, db: Session = Depends(get_db)):
    """
    Legacy catch-all resolver.
    If n8n requests /api/article/{id}, it might be looking for Content, Massage, Therapy, etc.
    if the workflow logic fell back to default.
    We search in order of likelyhood.
    """
    
    # 1. Try Content (Article)
    content = db.query(Content).filter(Content.id == id).first()
    if content:
        return content
        
    # 2. Try Massage
    massage = db.query(MassageType).filter(MassageType.id == id).first()
    if massage:
        # Inject type for clarity if needed
        return massage
        
    # 3. Try Therapy
    therapy = db.query(TherapyType).filter(TherapyType.id == id).first()
    if therapy:
        return therapy
        
    # 4. Try Yoga Class
    yoga = db.query(YogaClassDefinition).filter(YogaClassDefinition.id == id).first()
    if yoga:
        return yoga
        
    # 5. Try Activity
    activity = db.query(Activity).filter(Activity.id == id).first()
    if activity:
        return activity
        
    raise HTTPException(status_code=404, detail="Resource not found in any legacy collection")

@router.get("/meditation/{id}")
def get_meditation_legacy_resolver(id: int, db: Session = Depends(get_db)):
    """
    Legacy resolver for meditations.
    Maps /api/meditation/{id} to Content table.
    """
    content = db.query(Content).filter(Content.id == id).first()
    if content:
        return content
    raise HTTPException(status_code=404, detail="Meditation content not found")
