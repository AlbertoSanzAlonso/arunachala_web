from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import Personalization, User, Content, ContentType, ContentStatus
from app.api.auth import get_current_admin_user
from app.core.image_utils import save_upload_file, delete_file
import json
import logging
import re
import unicodedata

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/site-config", tags=["site-config"])

class SiteConfigSchema(BaseModel):
    key: str
    value: Optional[str] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True

@router.get("", response_model=List[SiteConfigSchema])
def get_all_config(db: Session = Depends(get_db)):
    """Get all site configurations"""
    return db.query(Personalization).all()

@router.get("/{key}", response_model=SiteConfigSchema)
def get_config_by_key(key: str, db: Session = Depends(get_db)):
    """Get a specific site configuration by key"""
    config = db.query(Personalization).filter(Personalization.key == key).first()
    if not config:
        # Return default empty object instead of 404 to avoid frontend errors
        return {"key": key, "value": None, "description": ""}
    return config

@router.put("/{key}", response_model=SiteConfigSchema)
def update_config(
    key: str, 
    value: str = Form(...),
    description: Optional[str] = Form(None),
    current_user: User = Depends(get_current_admin_user), 
    db: Session = Depends(get_db)
):
    """Update a site configuration (Admin only)"""
    config = db.query(Personalization).filter(Personalization.key == key).first()
    if not config:
        config = Personalization(key=key, value=value, description=description)
        db.add(config)
    else:
        config.value = value
        if description:
            config.description = description
    
    db.commit()
    db.refresh(config)
    return config

@router.post("/upload/{key}")
def upload_config_image(
    key: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    create_meditation: Optional[bool] = Form(False),
    meditation_title: Optional[str] = Form(None),
    meditation_description: Optional[str] = Form(None),
    meditation_thumbnail: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Upload an image or audio file for a configuration key (Admin only)"""
    
    # Save new file
    image_url = save_upload_file(file, subdirectory="site_customization")
    
    # Update or create config
    config = db.query(Personalization).filter(Personalization.key == key).first()
    
    # Optional: Delete old file — wrapped so a missing file doesn't abort save
    if config and config.value:
        try:
            still_used = db.query(Content).filter(Content.media_url == config.value).first()
            if not still_used:
                delete_file(config.value)
        except Exception as e:
            logger.warning(f"Could not delete old file '{config.value}': {e}")

    if not config:
        config = Personalization(key=key, value=image_url, description=f"File for {key}")
        db.add(config)
    else:
        config.value = image_url
        
    # If it's music and user wants to create a meditation from it
    if key == 'homepage_music_url' and create_meditation:
        thumbnail_url = None
        if meditation_thumbnail and meditation_thumbnail.filename:
            try:
                thumbnail_url = save_upload_file(meditation_thumbnail, subdirectory="meditations")
            except Exception as e:
                logger.warning(f"Could not save meditation thumbnail: {e}")

        # Generate a unique slug for the Content record (slug is UNIQUE in DB)
        raw_title = meditation_title or (file.filename or "musica-de-fondo")
        normalized = unicodedata.normalize('NFKD', raw_title.lower())
        ascii_title = normalized.encode('ascii', 'ignore').decode('ascii')
        base_slug = re.sub(r'[-\s]+', '-', re.sub(r'[^\w\s-]', '', ascii_title)).strip('-')[:80]
        if not base_slug:
            base_slug = "musica-fondo"
        slug = base_slug
        counter = 1
        while db.query(Content).filter(Content.slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1

        try:
            new_meditation = Content(
                type=ContentType.MEDITATION.value,
                status=ContentStatus.PUBLISHED.value,
                title=meditation_title or file.filename or "Nueva música de fondo",
                slug=slug,
                body=meditation_description,
                media_url=image_url,
                thumbnail_url=thumbnail_url or "/static/assets/logo_icon.webp",
                author_id=current_user.id
            )
            db.add(new_meditation)
            db.flush()
            
            # Automatically translate if there's text
            fields = {
                "title": new_meditation.title,
                "body": new_meditation.body,
                "excerpt": new_meditation.excerpt
            }
            fields = {k: v for k, v in fields.items() if v}
            if fields:
                from app.core.translation_utils import auto_translate_background
                from app.core.database import SessionLocal
                background_tasks.add_task(
                    auto_translate_background, 
                    SessionLocal, 
                    Content, 
                    new_meditation.id, 
                    fields
                )
        except Exception as e:
            db.rollback()
            # Restore the config to the session after a rollback
            config = db.query(Personalization).filter(Personalization.key == key).first()
            if not config:
                config = Personalization(key=key, value=image_url, description=f"File for {key}")
                db.add(config)
            else:
                config.value = image_url
            logger.error(f"Could not create meditation entry: {e}")
        
    db.commit()
    db.refresh(config)
    
    return {"url": image_url, "config": config}

@router.delete("/{key}")
def delete_config(
    key: str,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a site configuration and its associated image file (Admin only)"""
    from app.models.models import Content
    
    config = db.query(Personalization).filter(Personalization.key == key).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    
    # Special cleanup for background music: 
    # if it's music, and we have a meditation linked to this same URL, delete it too
    if config.value:
        # Delete image file if it exists
        delete_file(config.value)
        
        # If it's a music file and it's also a public meditation, remove the meditation too
        if key == 'homepage_music_url':
            associated_meditations = db.query(Content).filter(Content.media_url == config.value).all()
            for meditation in associated_meditations:
                db.delete(meditation)
    
    db.delete(config)
    db.commit()
    return {"message": "Configuration deleted successfully"}
