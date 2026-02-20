from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Content

router = APIRouter(tags=["announcements"])

@router.get("/{id}")
def get_announcement(id: int, db: Session = Depends(get_db)):
    """Get single announcement by ID"""
    content = db.query(Content).filter(Content.id == id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    # Optional: Verify type is indeed announcement
    # if content.type != 'announcement':
    #     raise HTTPException(status_code=400, detail="Content is not an announcement")
    
    return content

@router.get("/")
def get_announcements(db: Session = Depends(get_db)):
    """Get all announcements"""
    return db.query(Content).filter(Content.type == 'announcement').all()
