from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db, SessionLocal
from app.models.models import Tag
from app.core.translation_utils import auto_translate_background

router = APIRouter()

class TagBase(BaseModel):
    name: str
    category: Optional[str] = None
    translations: Optional[dict] = None

class TagCreate(TagBase):
    pass

class TagOut(TagBase):
    id: int
    
    class Config:
        from_attributes = True

import unicodedata

@router.get("", response_model=List[TagOut])
def get_tags(category: Optional[str] = None, in_use: bool = True, db: Session = Depends(get_db)):
    print(f"🔍 GET /api/tags - category: {category}, in_use: {in_use}")
    query = db.query(Tag)
    
    if category:
        query = query.filter(Tag.category == category)
    
    # Only tags that are linked to at least one PUBLISHED content item
    if in_use:
        from app.models.models import content_tags, Content
        # Join with association table and content table to check status
        in_use_ids = db.query(content_tags.c.tag_id).join(
            Content, Content.id == content_tags.c.content_id
        ).filter(Content.status == "published").distinct()
        
        query = query.filter(Tag.id.in_(in_use_ids))
        
    tags = query.all()
    
    # Deduplicate by name in memory to ensure unique labels in frontend
    # We use NFC normalization to handle visually identical accented characters
    unique_tags = {}
    for t in tags:
        normalized_name = unicodedata.normalize('NFC', t.name)
        name_key = normalized_name.lower().strip()
        if name_key not in unique_tags:
            unique_tags[name_key] = t
        else:
            # If current one has translations and existing doesn't, swap
            if t.translations and not unique_tags[name_key].translations:
                unique_tags[name_key] = t
                
    final_tags = list(unique_tags.values())
    print(f"   Returning {len(final_tags)} unique tags (from {len(tags)} total)")
    return final_tags

@router.post("", response_model=TagOut)
def create_tag(tag: TagCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Check duplicate with same name AND category
    query = db.query(Tag).filter(Tag.name == tag.name)
    if tag.category:
        query = query.filter(Tag.category == tag.category)
    else:
        query = query.filter(Tag.category.is_(None))
        
    db_tag = query.first()
    
    if db_tag:
        return db_tag # Return existing if duplicate
    
    new_tag = Tag(name=tag.name, translations=tag.translations, category=tag.category)
    db.add(new_tag)
    db.commit()
    db.refresh(new_tag)

    # Trigger background translation
    background_tasks.add_task(auto_translate_background, SessionLocal, Tag, new_tag.id, {"name": new_tag.name})
    
    return new_tag

@router.delete("/{tag_id}")
def delete_tag_if_orphan(tag_id: int, db: Session = Depends(get_db)):
    """
    Deletes a tag ONLY if it is not linked to any content.
    Used by the frontend to undo mistakes when creating new tags.
    """
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    # Check if it has any associated content
    if not tag.contents:
        db.delete(tag)
        db.commit()
        return {"status": "deleted", "tag_id": tag_id}
    
    return {"status": "kept", "message": "Tag is in use by other items"}
