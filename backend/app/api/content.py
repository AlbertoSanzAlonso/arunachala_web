from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import Content, User
from app.api.auth import get_current_user
from app.core.webhooks import notify_n8n_content_change
from app.core.translation_utils import auto_translate_background
from app.core.database import get_db, SessionLocal
from fastapi import BackgroundTasks

router = APIRouter(prefix="/api/content", tags=["content"])

class ContentBase(BaseModel):
    title: str
    body: Optional[str] = None
    type: str # article, mantra, etc
    status: str = "draft"
    thumbnail_url: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    translations: Optional[dict] = None

class ContentCreate(ContentBase):
    pass

class ContentUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    thumbnail_url: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    translations: Optional[dict] = None

class ContentResponse(ContentBase):
    id: int
    author_id: Optional[int]

    class Config:
        from_attributes = True

@router.get("", response_model=List[ContentResponse])
def get_contents(type: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Content)
    if type:
        query = query.filter(Content.type == type)
    return query.all()

@router.get("/{content_id}", response_model=ContentResponse)
def get_content(content_id: int, db: Session = Depends(get_db)):
    db_content = db.query(Content).filter(Content.id == content_id).first()
    if not db_content:
        raise HTTPException(status_code=404, detail="Content not found")
    return db_content

@router.post("", response_model=ContentResponse)
async def create_content(
    content_data: ContentCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_content = Content(**content_data.model_dump(), author_id=current_user.id)
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    
    # Notify n8n for RAG update if published
    if db_content.status == "published":
        await notify_n8n_content_change(db_content.id, db_content.type, "create")
    
    # Auto-translate if no translations provided
    if not content_data.translations and background_tasks:
        fields = {"title": content_data.title, "body": content_data.body}
        fields = {k: v for k, v in fields.items() if v}
        background_tasks.add_task(
            auto_translate_background, 
            SessionLocal, 
            Content, 
            db_content.id, 
            fields
        )
        
    return db_content

@router.put("/{content_id}", response_model=ContentResponse)
async def update_content(
    content_id: int,
    content_data: ContentUpdate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_content = db.query(Content).filter(Content.id == content_id).first()
    if not db_content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    for key, value in content_data.model_dump(exclude_unset=True).items():
        setattr(db_content, key, value)
    
    db.commit()
    db.refresh(db_content)
    
    # Notify n8n for RAG update if published
    if db_content.status == "published":
        await notify_n8n_content_change(db_content.id, db_content.type, "update")
    
    # Re-translate if main fields changed and no new translations provided
    if (content_data.title or content_data.body) and not content_data.translations:
        fields = {"title": db_content.title, "body": db_content.body}
        fields = {k: v for k, v in fields.items() if v}
        background_tasks.add_task(
            auto_translate_background, 
            SessionLocal, 
            Content, 
            db_content.id, 
            fields
        )
        
    return db_content

@router.delete("/{content_id}")
async def delete_content(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_content = db.query(Content).filter(Content.id == content_id).first()
    if not db_content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Notify n8n
    await notify_n8n_content_change(db_content.id, db_content.type, "delete")
    
    db.delete(db_content)
    db.commit()
    return {"message": "Content deleted successfully"}
