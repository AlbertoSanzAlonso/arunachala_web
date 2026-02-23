from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import Personalization, User
from app.api.auth import get_current_admin_user
from app.core.image_utils import save_upload_file, delete_file
import json

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
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Upload an image for a configuration key (Admin only)"""
    # Save image
    image_url = save_upload_file(file, subdirectory="site_customization")
    
    # Update or create config
    config = db.query(Personalization).filter(Personalization.key == key).first()
    
    # Optional: Delete old image
    if config and config.value:
        delete_file(config.value)

    if not config:
        config = Personalization(key=key, value=image_url, description=f"Image for {key}")
        db.add(config)
    else:
        config.value = image_url
        
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
    config = db.query(Personalization).filter(Personalization.key == key).first()
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    
    # Delete image file if it exists
    if config.value:
        delete_file(config.value)
    
    db.delete(config)
    db.commit()
    return {"message": "Configuration deleted successfully"}
