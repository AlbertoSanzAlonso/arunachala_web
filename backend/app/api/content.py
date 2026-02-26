from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.core.database import get_db
from app.models.models import Content, User, Tag
from app.api.auth import get_current_user
from app.core.webhooks import notify_n8n_content_change
from app.core.translation_utils import auto_translate_background
from app.core.database import get_db, SessionLocal
from app.core.image_utils import delete_file, save_image_from_bytes
from fastapi import BackgroundTasks
import re
import os
import uuid
import shutil
import httpx
from unidecode import unidecode
from urllib.parse import quote
from io import BytesIO
from PIL import Image

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

def process_tags(tags: Optional[List[str]]) -> Optional[List[str]]:
    """Capitalize first letter of each tag"""
    if not tags:
        return None
    return [tag.capitalize() for tag in tags if tag]

def sync_content_tags(db: Session, content: Content, tags_list: Optional[List[str]], background_tasks: Optional[BackgroundTasks] = None, content_translations: Optional[dict] = None):
    """
    Syncs the tags list with the Tag table and updates the content relationship.
    Handles 'Find or Create' logic for each tag.
    Also updates tag translations if provided in content_translations.
    """
    if not tags_list:
        content.tag_entities = []
        return

    tag_objects = []
    
    # Determine tag category based on content
    tag_category = 'general'
    if content.type == 'meditation':
        tag_category = 'meditation'
    elif content.type == 'article':
        # Use content category (yoga, therapy, general)
        tag_category = content.category or 'general'
        
    print(f"🏷️ Syncing tags for category: {tag_category}")

    for i, tag_name in enumerate(tags_list):
        normalized_name = tag_name.strip()
        if not normalized_name:
            continue
            
        # Check if tag exists (case-sensitive + category)
        tag = db.query(Tag).filter(Tag.name == normalized_name, Tag.category == tag_category).first()
        if not tag:
            print(f"🆕 Creating new tag: {normalized_name} [{tag_category}]")
            tag = Tag(name=normalized_name, category=tag_category)
            db.add(tag)
            db.flush() # Generate ID for new tag
            
            # Trigger background translation for the new tag ONLY if incomplete translations
            if background_tasks:
                background_tasks.add_task(auto_translate_background, SessionLocal, Tag, tag.id, {"name": tag.name})
        
        # Update explicit translations if provided
        if content_translations:
            updates = {}
            for lang, data in content_translations.items():
                if data and isinstance(data, dict) and 'tags' in data:
                    t_list = data['tags']
                    if isinstance(t_list, list) and len(t_list) > i:
                        val = t_list[i]
                        if val and isinstance(val, str):
                            updates[lang] = val.strip()
            
            if updates:
                current = dict(tag.translations) if tag.translations else {}
                current.update(updates)
                tag.translations = current
                db.add(tag) # Ensure update is tracked

        tag_objects.append(tag)
    
    print(f"🔗 Linking {len(tag_objects)} tags to content")
    content.tag_entities = tag_objects

def cleanup_orphan_tags(db: Session):
    """
    Removes any tag that is not linked to any content.
    Enforces 'only tags in use exist' policy.
    """
    from app.models.models import content_tags # Ensure it's available
    
    # Direct query on association table is more reliable than .any()
    # Find tag IDs that are present in the association table
    in_use_tag_ids = db.query(content_tags.c.tag_id).distinct()
    
    # Filter tags NOT in that list
    orphans = db.query(Tag).filter(~Tag.id.in_(in_use_tag_ids)).all()
    
    if orphans:
        print(f"🧹 FOUND ORPHANS: {[t.name for t in orphans]}")
        print(f"🧹 Clearing {len(orphans)} orphan tags...")
        for tag in orphans:
            db.delete(tag)
        db.commit()
    else:
        print("✅ No orphan tags found.")

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
    author_id: Optional[int] = None

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

class AuthorResponse(BaseModel):
    id: int
    first_name: Optional[str]
    last_name: Optional[str]
    
    class Config:
        from_attributes = True

class ContentResponse(ContentBase):
    id: int
    slug: str
    author_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    author: Optional[AuthorResponse] = None
    view_count: Optional[int] = 0
    play_time_seconds: Optional[int] = 0

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
        
        # Unified path logic: articles go to gallery/articles
        target_subpath = folder
        if folder == "articles":
            target_subpath = "gallery/articles"
            
        save_dir = os.path.join(base_path, "static", target_subpath)
        os.makedirs(save_dir, exist_ok=True)
        
        # Generate filename from prompt
        from app.core.image_utils import slugify
        base_name = slugify(prompt)[:50] if prompt else "gen"
        filename = f"{base_name}-{uuid.uuid4().hex[:8]}.jpg"
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
            
            # Save image using unified logic (local or supabase)
            url = save_image_from_bytes(response.content, subdirectory=target_subpath, filename=filename)
            print(f"Image saved to: {url}")
                
        # Return URL
        return {"url": url}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error generating image: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("", response_model=List[ContentResponse])
def get_contents(
    content_type: Optional[str] = Query(None, alias="type"),
    category: Optional[str] = None,
    status: Optional[str] = None,
    author_id: Optional[int] = Query(None, description="Filter by author ID (e.g. 4 for AI Agent)"),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Content).options(joinedload(Content.author))
        
        if content_type:
            query = query.filter(Content.type == content_type)
        if category:
            query = query.filter(Content.category == category)
        if status:
            query = query.filter(Content.status == status)
        if author_id is not None:
            query = query.filter(Content.author_id == author_id)
            
        results = query.order_by(Content.created_at.desc()).all()
        
        # Robustly handle potential JSON parsing issues from DB
        for item in results:
            if item.tags and isinstance(item.tags, str):
                try:
                    import json
                    item.tags = json.loads(item.tags)
                    if not isinstance(item.tags, list):
                        item.tags = [str(item.tags)]
                except:
                    item.tags = []
                    
        return results
    except Exception as e:
        print(f"🔥 ERROR in get_contents: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error interno al recuperar contenido: {str(e)}")

@router.get("/ranking", response_model=List[ContentResponse])
def get_content_ranking(
    content_type: Optional[str] = Query(None, alias="type"),
    category: Optional[str] = None,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """Get most viewed content, optionally filtered by type and category"""
    query = db.query(Content).filter(Content.status == "published").options(joinedload(Content.author))
    
    if content_type:
        query = query.filter(Content.type == content_type)
    if category:
        query = query.filter(Content.category == category)
        
    return query.order_by(Content.view_count.desc()).limit(limit).all()

@router.get("/slug/{slug}", response_model=ContentResponse)
def get_content_by_slug(slug: str, db: Session = Depends(get_db)):
    db_content = db.query(Content).filter(Content.slug == slug).first()
    if not db_content:
        raise HTTPException(status_code=404, detail="Content not found")
        
    # Increment view count
    db_content.view_count = (db_content.view_count or 0) + 1
    db.commit()
    db.refresh(db_content)
    
    return db_content

class PlaybackData(BaseModel):
    seconds: int

@router.post("/slug/{slug}/playback")
def record_playback(
    slug: str,
    data: PlaybackData,
    db: Session = Depends(get_db)
):
    db_content = db.query(Content).filter(Content.slug == slug).first()
    if not db_content:
        raise HTTPException(status_code=404, detail="Content not found")
        
    db_content.play_time_seconds = (db_content.play_time_seconds or 0) + data.seconds
    db.commit()
    
    return {"success": True, "total_seconds": db_content.play_time_seconds}

@router.get("/{content_id}", response_model=ContentResponse)
def get_content(content_id: int, db: Session = Depends(get_db)):
    db_content = db.query(Content).filter(Content.id == content_id).first()
    if not db_content:
        raise HTTPException(status_code=404, detail="Content not found")
        
    # Increment view count
    db_content.view_count = (db_content.view_count or 0) + 1
    db.commit()
    db.refresh(db_content)
    
    return db_content

async def download_remote_image(url: str, slug: str) -> Optional[str]:
    """
    Downloads an image from a remote URL and saves it locally.
    Returns the local relative path or None if failed.
    """
    if not url or not url.startswith(('http://', 'https://')):
        return None
        
    try:
        # Define storage path
        base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        # Unified path: static/gallery/articles
        save_dir = os.path.join(base_path, "static", "gallery", "articles")
        os.makedirs(save_dir, exist_ok=True)
        
        # Always save as WebP
        filename = f"{slug}-{uuid.uuid4().hex[:8]}.webp"
        file_path = os.path.join(save_dir, filename)
        
        print(f"Downloading image from {url} to {file_path} (converting to WebP)")
        
        async with httpx.AsyncClient(follow_redirects=True) as client:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
                "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
            }
            response = await client.get(url, headers=headers, timeout=30.0)
            if response.status_code == 200:
                print(f"✅ Downloaded {len(response.content)} bytes from {url}")
                # Save image using unified logic (local or supabase)
                # We specifically pass the SEO filename here
                local_path = save_image_from_bytes(response.content, subdirectory="gallery/articles", filename=filename)
                if local_path:
                    print(f"✅ Image saved/uploaded: {local_path}")
                return local_path
            else:
                print(f"❌ Failed to download image: Status {response.status_code} for {url}")
                return None
                
    except Exception as e:
        print(f"🔥 CRITICAL ERROR downloading image: {e}")
        import traceback
        traceback.print_exc()
        return None

@router.post("", response_model=ContentResponse)
async def create_content(
    content_data: ContentCreate,
    background_tasks: BackgroundTasks,
    # current_user: User = Depends(get_current_user),  # Disabled for/n8n automation
    db: Session = Depends(get_db)
):
    # Mock user for automation if needed, or handle author_id logic
    current_user_id = content_data.author_id if content_data.author_id else 1 
    # if current_user.role != "admin":
    #     raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check for duplicate title (case-insensitive) for the same type
    existing_content = db.query(Content).filter(
        Content.title.ilike(content_data.title),
        Content.type == content_data.type
    ).first()
    if existing_content:
        type_label = "artículo" if content_data.type == "article" else "meditación"
        raise HTTPException(
            status_code=400, 
            detail=f"Ya existe un {type_label} con el título '{content_data.title}'. Por favor, elige uno diferente."
        )
    
    # Generate slug from title
    slug = generate_slug(content_data.title, db)
    
    print(f"🚀 CREATE PROCESS: Slug='{slug}', Thumb='{content_data.thumbnail_url}', AuthorID='{content_data.author_id}'")

    # Process tags (capitalize)
    print(f"📝 Raw tags received: {content_data.tags}")
    processed_tags = process_tags(content_data.tags)
    print(f"✨ Processed tags: {processed_tags}")
    
    # Handle image download if it's a remote URL
    if content_data.thumbnail_url and content_data.thumbnail_url.startswith(('http://', 'https://')):
        print(f"🖼️ Found remote URL, downloading...")
        local_path = await download_remote_image(content_data.thumbnail_url, slug)
        if local_path:
            print(f"✅ Image downloaded: {local_path}")
            content_data.thumbnail_url = local_path
        else:
            print(f"⚠️ Image download FAILED. Keeping original URL.")
    
    # Force category to None for meditations, or validate for articles
    content_dict = content_data.model_dump(exclude={'tags', 'author_id'})
    if content_data.type == 'meditation':
        content_dict['category'] = None
        # Set default thumbnail if missing for meditations
        if not content_dict.get('thumbnail_url'):
            content_dict['thumbnail_url'] = '/static/gallery/articles/meditation_default.webp'
    elif content_data.type == 'article':
        if content_dict.get('category') not in ['yoga', 'therapy']:
            raise HTTPException(status_code=400, detail="Los artículos deben tener la categoría 'yoga' o 'therapy'")
        
        # Set default thumbnail if missing for articles
        if not content_dict.get('thumbnail_url'):
            if content_dict.get('category') == 'yoga':
                content_dict['thumbnail_url'] = '/static/gallery/articles/om_symbol.webp'
            elif content_dict.get('category') == 'therapy':
                content_dict['thumbnail_url'] = '/static/gallery/articles/lotus_flower.webp'

    db_content = Content(
        **content_dict,
        slug=slug,
        tags=processed_tags,
        author_id=current_user_id
    )
    
    # Sync with Tag table
    sync_content_tags(db, db_content, processed_tags, background_tasks=background_tasks, content_translations=content_data.translations)
    
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    
    cleanup_orphan_tags(db)
    
    from app.models.models import DashboardActivity
    # Log to dashboard activity
    type_label = {
        'article': 'Artículo',
        'meditation': 'Meditación',
        'mantra': 'Mantra',
        'service': 'Servicio',
        'announcement': 'Anuncio'
    }.get(db_content.type, 'Contenido')
    
    prefix = "Nueva" if db_content.type == 'meditation' else "Nuevo"
    
    activity_log = DashboardActivity(
        type='content',
        action='created',
        title=f"{prefix} {type_label}: {db_content.title}",
        entity_id=db_content.id
    )
    db.add(activity_log)
    db.commit()
    
    # Notify n8n for RAG update if published
    if db_content.status == "published":
        print(f"Triggering RAG sync for new content #{db_content.id}")
        background_tasks.add_task(notify_n8n_content_change, db_content.id, db_content.type, "create", db=None)
    
    # Auto-translate if no translations provided
    if not content_data.translations and background_tasks:
        fields = {
            "title": content_data.title,
            "body": content_data.body,
            "excerpt": content_data.excerpt,
            "tags": processed_tags
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
    current_slug = db_content.slug
    if content_data.title and content_data.title != db_content.title:
        # Check for duplicate title
        target_type = content_data.type or db_content.type
        existing_content = db.query(Content).filter(
            Content.title.ilike(content_data.title),
            Content.type == target_type,
            Content.id != content_id
        ).first()
        if existing_content:
            type_label = "artículo" if target_type == "article" else "meditación"
            raise HTTPException(
                status_code=400, 
                detail=f"Ya existe otro {type_label} con el título '{content_data.title}'."
            )

        current_slug = generate_slug(content_data.title, db, content_id)
        db_content.slug = current_slug
    
    # Handle image download if it's a NEW remote URL
    if content_data.thumbnail_url and content_data.thumbnail_url.startswith('http'):
        if content_data.thumbnail_url != db_content.thumbnail_url:
            local_path = await download_remote_image(content_data.thumbnail_url, current_slug)
            if local_path:
                content_data.thumbnail_url = local_path


    
    # Update fields
    content_dict = content_data.model_dump(exclude_unset=True, exclude={'tags'})
    
    # Validation for articles
    target_type = content_dict.get('type') or db_content.type
    if target_type == 'meditation':
        content_dict['category'] = None
        # Set default thumbnail if missing/cleared for meditations
        current_thumb = content_dict.get('thumbnail_url') if 'thumbnail_url' in content_dict else db_content.thumbnail_url
        if not current_thumb:
            content_dict['thumbnail_url'] = '/static/gallery/articles/meditation_default.webp'
    elif target_type == 'article':
        # If it's being set now, or if it was already an article and category is being updated
        # we check the new category value if provided, else we check existing one
        new_cat = content_dict.get('category')
        if new_cat is not None and new_cat not in ['yoga', 'therapy']:
             raise HTTPException(status_code=400, detail="Los artículos deben tener la categoría 'yoga' o 'therapy'")
        
        changing_to_article = content_dict.get('type') == 'article'
        if changing_to_article and not new_cat and db_content.category not in ['yoga', 'therapy']:
             raise HTTPException(status_code=400, detail="Al cambiar a artículo, se debe especificar la categoría 'yoga' o 'therapy'")
        
        # Set default thumbnail if missing/cleared for articles
        current_thumb = content_dict.get('thumbnail_url') if 'thumbnail_url' in content_dict else db_content.thumbnail_url
        if not current_thumb:
            cat = content_dict.get('category') or db_content.category
            if cat == 'yoga':
                content_dict['thumbnail_url'] = '/static/gallery/articles/om_symbol.webp'
            elif cat == 'therapy':
                content_dict['thumbnail_url'] = '/static/gallery/articles/lotus_flower.webp'

    # Capture original status before update
    original_status = db_content.status

    for key, value in content_dict.items():
        setattr(db_content, key, value)
    
    # Update tags if provided
    if content_data.tags is not None:
        processed_tags = process_tags(content_data.tags)
        db_content.tags = processed_tags
        # Sync with Tag table
        sync_content_tags(db, db_content, processed_tags, background_tasks=background_tasks)
    
    db.commit()
    db.refresh(db_content)

    cleanup_orphan_tags(db)
    
    # Notify n8n for RAG sync
    if db_content.status == "published":
        print(f"Triggering RAG sync for updated content #{db_content.id} (update)")
        background_tasks.add_task(notify_n8n_content_change, db_content.id, db_content.type, "update", db=None)
    elif original_status == "published" and db_content.status != "published":
        print(f"Triggering RAG sync for unpublished content #{db_content.id} (delete)")
        background_tasks.add_task(notify_n8n_content_change, db_content.id, db_content.type, "delete", db=None)
    
    # Re-translate if main fields changed
    # We remove the check for 'not content_data.translations' because the frontend sends back old translations
    # but doesn't allow editing them, so we must auto-update translations if source content changes.
    if (content_data.title or content_data.body or content_data.excerpt or content_data.tags is not None):
        fields = {
            "title": content_data.title or db_content.title,
            "body": content_data.body or db_content.body,
            "excerpt": content_data.excerpt or db_content.excerpt,
            "tags": db_content.tags
        }
        fields = {k: v for k, v in fields.items() if v}
        print(f"🔄 QUEUEING TRANSLATION for #{db_content.id} with fields: {list(fields.keys())}")
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
    background_tasks.add_task(notify_n8n_content_change, db_content.id, db_content.type, "delete", db=None, entity=db_content)
    
    # Log to dashboard activity before deleting
    from app.models.models import DashboardActivity
    activity_log = DashboardActivity(
        type='content',
        action='deleted',
        title=db_content.title,
        entity_id=content_id
    )
    db.add(activity_log)
    
    # Clean up associated files (images and audio)
    if db_content.thumbnail_url:
        delete_file(db_content.thumbnail_url)
    if db_content.media_url:
        delete_file(db_content.media_url)
    
    db.delete(db_content)
    db.commit()
    
    # Clean up tags that are no longer in use
    cleanup_orphan_tags(db)

    return {"message": "Content deleted successfully"}




