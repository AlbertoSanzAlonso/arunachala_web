from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.core.database import get_db
from app.models.models import Content, User
from app.api.auth import get_current_user
from app.core.webhooks import notify_n8n_content_change
from app.core.translation_utils import auto_translate_background
from app.core.database import get_db, SessionLocal
from fastapi import BackgroundTasks
import re
import os
import uuid
import shutil
import httpx
from unidecode import unidecode
from urllib.parse import quote

router = APIRouter(prefix="/api/content", tags=["content"])

def generate_slug(title: str, db: Session, content_id: Optional[int] = None) -> str:
    """Generate a unique slug from title"""
    # Convert to lowercase and replace spaces with hyphens
    slug = unidecode(title.lower())
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[-\s]+', '-', slug)
    slug = slug.strip('-')
    
    # Check if slug exists
    base_slug = slug
    counter = 1
    while True:
        existing = db.query(Content).filter(Content.slug == slug)
        if content_id:
            existing = existing.filter(Content.id != content_id)
        if not existing.first():
            break
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    return slug

def delete_media_file(media_url: str) -> bool:
    """Delete a media file from storage given its URL"""
    if not media_url:
        return False
    
    try:
        # Extract filename from URL (e.g., "/static/audio/filename.mp3" -> "filename.mp3")
        if media_url.startswith("/static/audio/"):
            filename = media_url.replace("/static/audio/", "")
            file_path = os.path.join("static", "audio", filename)
            
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"Deleted media file: {file_path}")
                return True
        return False
    except Exception as e:
        print(f"Error deleting media file: {e}")
        return False


class ContentBase(BaseModel):
    title: str
    body: Optional[str] = None
    excerpt: Optional[str] = None
    type: str # article, mantra, etc
    category: Optional[str] = None  # 'yoga', 'therapy', 'general'
    status: str = "draft"
    thumbnail_url: Optional[str] = None
    media_url: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    tags: Optional[List[str]] = None
    translations: Optional[dict] = None

class ContentCreate(ContentBase):
    pass

class ContentUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    excerpt: Optional[str] = None
    type: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    thumbnail_url: Optional[str] = None
    media_url: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    tags: Optional[List[str]] = None
    translations: Optional[dict] = None

class ContentResponse(ContentBase):
    id: int
    slug: str
    author_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class GenerateImageRequest(BaseModel):
    prompt: str
    folder: str = "articles"

@router.get("/generate-ai-image")
async def generate_image(
    prompt: str,
    folder: str = "articles",
    current_user: User = Depends(get_current_user)
):
    """
    Generate an image using Pollinations.ai (free API) and save it locally.
    """
    try:
        # Create a pseudo-request object to reuse logic if needed, or just use vars
        # Validate folder to prevent directory traversal or invalid folders
        allowed_folders = ["articles", "meditations", "yoga", "therapy"]
        if folder not in allowed_folders:
            folder = "articles"

        # Create directory if it doesn't exist
        # Use absolute path relative to this file to be safe
        base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        save_dir = os.path.join(base_path, "static", folder)
        os.makedirs(save_dir, exist_ok=True)
        
        # Generate filename
        filename = f"gen_{uuid.uuid4().hex}.jpg"
        file_path = os.path.join(save_dir, filename)
        
        # Prepare URL (Pollinations doesn't require API key)
        # We append some style keywords to ensure better quality suitable for the theme
        enhanced_prompt = f"{prompt}, high quality, spiritual, yoga, peaceful, cinematic lighting, photorealistic, calm atmosphere"
        encoded_prompt = quote(enhanced_prompt)
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=600&nologo=true"
        
        print(f"Generating image from: {image_url}")
        
        async with httpx.AsyncClient(follow_redirects=True) as client:
            # Add a user agent to avoid being blocked by some firewalls
            headers = {"User-Agent": "ArunachalaWeb/1.0"}
            response = await client.get(image_url, headers=headers, timeout=60.0)
            
            if response.status_code != 200:
                print(f"Pollinations API error: {response.status_code} - {response.text}")
                # Check for 502/503 (Upstream error)
                if response.status_code in [502, 503, 504]:
                     raise HTTPException(status_code=503, detail="El servicio de IA está temporalmente saturado. Por favor intenta en unos minutos.")
                
                raise HTTPException(status_code=502, detail=f"Error del proveedor de IA: {response.status_code}")
            
            # Save image locally
            with open(file_path, "wb") as f:
                f.write(response.content)
                
            print(f"Image saved to: {file_path}")
                
        # Return relative URL
        return {"url": f"/static/{folder}/{filename}"}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error generating image: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("", response_model=List[ContentResponse])
def get_contents(
    type: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Content)
    if type:
        query = query.filter(Content.type == type)
    if category:
        query = query.filter(Content.category == category)
    if status:
        query = query.filter(Content.status == status)
    return query.order_by(Content.created_at.desc()).all()

@router.get("/slug/{slug}", response_model=ContentResponse)
def get_content_by_slug(slug: str, db: Session = Depends(get_db)):
    db_content = db.query(Content).filter(Content.slug == slug).first()
    if not db_content:
        raise HTTPException(status_code=404, detail="Content not found")
    return db_content

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
    # if current_user.role != "admin":
    #     raise HTTPException(status_code=403, detail="Not authorized")
    
    # Generate slug from title
    slug = generate_slug(content_data.title, db)
    
    # Convert tags list to JSON if provided
    tags_json = content_data.tags if content_data.tags else None
    
    db_content = Content(
        **content_data.model_dump(exclude={'tags'}),
        slug=slug,
        tags=tags_json,
        author_id=current_user.id
    )
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    
    # Notify n8n for RAG update if published
    if db_content.status == "published":
        await notify_n8n_content_change(db_content.id, db_content.type, "create", db=db)
    
    # Auto-translate if no translations provided
    if not content_data.translations and background_tasks:
        fields = {
            "title": content_data.title,
            "body": content_data.body,
            "excerpt": content_data.excerpt
        }
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
    # if current_user.role != "admin":
    #     raise HTTPException(status_code=403, detail="Not authorized")
    
    db_content = db.query(Content).filter(Content.id == content_id).first()
    if not db_content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Update slug if title changed
    if content_data.title and content_data.title != db_content.title:
        db_content.slug = generate_slug(content_data.title, db, content_id)
    
    # Delete old audio file if media_url is being changed
    if content_data.media_url is not None and db_content.media_url and content_data.media_url != db_content.media_url:
        delete_media_file(db_content.media_url)
    
    # Update fields
    for key, value in content_data.model_dump(exclude_unset=True, exclude={'tags'}).items():
        setattr(db_content, key, value)
    
    # Update tags if provided
    if content_data.tags is not None:
        db_content.tags = content_data.tags
    
    db.commit()
    db.refresh(db_content)
    
    # Notify n8n for RAG update if published
    if db_content.status == "published":
        await notify_n8n_content_change(db_content.id, db_content.type, "update", db=db)
    
    # Re-translate if main fields changed and no new translations provided
    if (content_data.title or content_data.body or content_data.excerpt) and not content_data.translations:
        fields = {
            "title": db_content.title,
            "body": db_content.body,
            "excerpt": db_content.excerpt
        }
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
    
    # Delete associated media file if exists
    if db_content.media_url:
        delete_media_file(db_content.media_url)
    
    # Notify n8n
    await notify_n8n_content_change(db_content.id, db_content.type, "delete", db=db)
    
    # Log to dashboard activity before deleting
    from app.models.models import DashboardActivity
    activity_log = DashboardActivity(
        type='content',
        action='deleted',
        title=db_content.title,
        entity_id=content_id
    )
    db.add(activity_log)
    
    db.delete(db_content)
    db.commit()
    return {"message": "Content deleted successfully"}




