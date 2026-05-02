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
    
    print(f"🔍 Legacy resolver for ID: {id}")
    try:
        # 1. Try Content (Article/Meditation)
        content = db.query(Content).filter(Content.id == id).first()
        if content:
            print(f"✅ Found in Content: {content.title}")
            return content
            
        # 2. Try Massage
        massage = db.query(MassageType).filter(MassageType.id == id).first()
        if massage:
            print(f"✅ Found in Massage: {massage.name}")
            return massage
            
        # 3. Try Therapy
        therapy = db.query(TherapyType).filter(TherapyType.id == id).first()
        if therapy:
            print(f"✅ Found in Therapy: {therapy.name}")
            return therapy
            
        # 4. Try Yoga Class
        yoga = db.query(YogaClassDefinition).filter(YogaClassDefinition.id == id).first()
        if yoga:
            print(f"✅ Found in YogaClass: {yoga.name}")
            return yoga
            
        # 5. Try Activity
        activity = db.query(Activity).filter(Activity.id == id).first()
        if activity:
            print(f"✅ Found in Activity: {activity.title}")
            return activity
            
        print(f"❌ ID {id} not found in any collection")
        raise HTTPException(status_code=404, detail="Resource not found in any legacy collection")
    except Exception as e:
        print(f"🔥 CRITICAL ERROR in legacy resolver for ID {id}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

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
