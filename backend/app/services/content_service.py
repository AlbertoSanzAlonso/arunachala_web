import re
import os
import uuid
import httpx
from typing import List, Optional
from unidecode import unidecode
from sqlalchemy.orm import Session
from fastapi import BackgroundTasks

from app.models.models import Content, Tag
from app.core.database import SessionLocal
from app.core.translation_utils import auto_translate_background
from app.core.image_utils import save_image_from_bytes

def generate_slug(title: str, db: Session, content_id: Optional[int] = None) -> str:
    """Generate a unique slug from title"""
    slug = unidecode(title.lower())
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[-\s]+', '-', slug)
    slug = slug.strip('-')
    
    base_slug = slug
    counter = 1
    query = db.query(Content).filter(Content.slug == slug)
    if content_id:
        query = query.filter(Content.id != content_id)
    
    while query.first():
        slug = f"{base_slug}-{counter}"
        query = db.query(Content).filter(Content.slug == slug)
        if content_id:
            query = query.filter(Content.id != content_id)
        counter += 1
    return slug

def process_tags(tags_data: Optional[List[str]]) -> List[str]:
    """Process and normalize tags"""
    if not tags_data:
        return []
    processed = []
    for tag in tags_data:
        if isinstance(tag, str):
            clean_tag = tag.strip().lower()
            if clean_tag and clean_tag not in processed:
                processed.append(clean_tag)
    return processed

def sync_content_tags(db: Session, content: Content, tags_list: List[str], background_tasks: BackgroundTasks = None, content_translations: dict = None):
    """Sync tags between Content and Tag table, triggering translation if needed"""
    current_tags = db.query(Tag).filter(Tag.name.in_(tags_list)).all()
    existing_names = {t.name for t in current_tags}
    
    new_tags = []
    for name in tags_list:
        if name not in existing_names:
            tag_obj = Tag(name=name)
            db.add(tag_obj)
            new_tags.append(tag_obj)
            
    if new_tags and background_tasks:
        db.flush()
        for nt in new_tags:
            background_tasks.add_task(auto_translate_background, SessionLocal, Tag, nt.id, {"name": nt.name})

def cleanup_orphan_tags(db: Session):
    """Remove tags that are not associated with any content"""
    all_contents = db.query(Content.tags).all()
    used_tags = set()
    for c_tags in all_contents:
        if c_tags[0]:
            if isinstance(c_tags[0], list):
                used_tags.update(c_tags[0])
            elif isinstance(c_tags[0], str):
                import json
                try:
                    parsed = json.loads(c_tags[0])
                    if isinstance(parsed, list): used_tags.update(parsed)
                except: pass
    
    if used_tags:
        db.query(Tag).filter(~Tag.name.in_(list(used_tags))).delete(synchronize_session=False)
        db.commit()

async def download_remote_image(image_url: str, slug: str) -> Optional[str]:
    """Download a remote image and save it locally/Supabase"""
    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(image_url, timeout=30.0)
            if response.status_code == 200:
                filename = f"{slug}-{uuid.uuid4().hex[:8]}.webp"
                return save_image_from_bytes(response.content, subdirectory="gallery/articles", filename=filename)
    except Exception as e:
        print(f"Error downloading remote image: {e}")
    return None
