from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
from urllib.parse import quote
import os
import uuid
import httpx
import json as _json

from app.core.database import get_db, SessionLocal
from app.models.models import Content, User, Tag, DashboardActivity
from app.api.auth import get_current_user
from app.core.webhooks import notify_n8n_content_change
from app.core.translation_utils import auto_translate_background
from app.core.image_utils import delete_file, save_image_from_bytes, save_upload_file

# Import modularized schemas and services
from app.schemas.content import (
    ContentCreate, ContentUpdate, ContentResponse, 
    PlaybackRecord, GenerateImageRequest
)
from app.services.content_service import (
    generate_slug, process_tags, sync_content_tags, 
    cleanup_orphan_tags, download_remote_image
)

router = APIRouter(prefix="/api/content", tags=["content"])

def is_translations_empty(translations):
    """Deep check if translations dictionary has any actual content"""
    if not translations: return True
    if not isinstance(translations, dict): return True
    for lang_data in translations.values():
        if isinstance(lang_data, dict):
            for val in lang_data.values():
                if val and (isinstance(val, str) and val.strip() or isinstance(val, list) and len(val) > 0):
                    return False
    return True

def hydrate_content(item: Content):
    """Helper to ensure tags are lists and URLs are clean before returning to frontend"""
    if not item: return item
    
    # Ensure tags is a list
    if item.tags and isinstance(item.tags, str):
        try:
            parsed = _json.loads(item.tags)
            item.tags = parsed if isinstance(parsed, list) else [str(parsed)]
        except Exception: 
            item.tags = []
    elif not item.tags:
        item.tags = []
        
    # Clean URLs
    if item.thumbnail_url in ("null", "", "undefined"): item.thumbnail_url = None
    if item.media_url in ("null", "", "undefined"): item.media_url = None
    
    return item

@router.get("/generate-ai-image")
async def generate_image(
    prompt: str,
    folder: str = "articles",
    current_user: User = Depends(get_current_user)
):
    """Generate an image using Pollinations.ai (free API) and save it locally."""
    try:
        allowed_folders = ["articles", "meditations", "yoga", "therapy"]
        if folder not in allowed_folders:
            folder = "articles"

        base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        target_subpath = "gallery/articles" if folder == "articles" else folder
            
        save_dir = os.path.join(base_path, "static", target_subpath)
        os.makedirs(save_dir, exist_ok=True)
        
        from app.core.image_utils import slugify
        base_name = slugify(prompt)[:50] if prompt else "gen"
        filename = f"{base_name}-{uuid.uuid4().hex[:8]}.jpg"
        
        enhanced_prompt = f"{prompt}, high quality, spiritual, yoga, peaceful, cinematic lighting, photorealistic, calm atmosphere"
        encoded_prompt = quote(enhanced_prompt)
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=600&nologo=true"
        
        async with httpx.AsyncClient(follow_redirects=True) as client:
            headers = {"User-Agent": "ArunachalaWeb/1.0"}
            response = await client.get(image_url, headers=headers, timeout=60.0)
            
            if response.status_code != 200:
                if response.status_code in [502, 503, 504]:
                     raise HTTPException(status_code=503, detail="El servicio de IA está temporalmente saturado.")
                raise HTTPException(status_code=502, detail=f"Error del proveedor de IA: {response.status_code}")
            
            url = save_image_from_bytes(response.content, subdirectory=target_subpath, filename=filename)
                
        return {"url": url}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error generating image: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.post("/upload-media")
@router.post("/upload-media/")
async def upload_media(
    file: UploadFile = File(...),
    folder: str = Form("articles"),
    db: Session = Depends(get_db)
):
    """Generic media upload endpoint for the dashboard."""
    try:
        allowed_folders = ["articles", "meditations", "yoga", "therapy", "massages", "uploads"]
        if folder not in allowed_folders:
            folder = "uploads"
            
        subdirectory = f"gallery/{folder}" if folder in ["articles", "meditations"] else folder
        url = save_upload_file(file, subdirectory=subdirectory)
        
        return {"url": url}
    except Exception as e:
        print(f"🔥 Error uploading media: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=List[ContentResponse])
def get_contents(
    content_type: Optional[str] = Query(None, alias="type"),
    category: Optional[str] = None,
    status: Optional[str] = None,
    author_id: Optional[int] = Query(None, description="Filter by author ID"),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Content).options(joinedload(Content.author))
        
        if content_type: query = query.filter(Content.type == content_type)
        if category: query = query.filter(Content.category == category)
        if status: query = query.filter(Content.status == status)
        if author_id is not None: query = query.filter(Content.author_id == author_id)
            
        results = query.order_by(Content.created_at.desc()).all()
        return [hydrate_content(item) for item in results]
    except Exception as e:
        print(f"🔥 ERROR in get_contents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al recuperar contenido: {str(e)}")

@router.get("/ranking", response_model=List[ContentResponse])
def get_content_ranking(
    content_type: Optional[str] = Query(None, alias="type"),
    category: Optional[str] = None,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Content).filter(Content.status == "published").options(joinedload(Content.author))
        if content_type: query = query.filter(Content.type == content_type)
        if category: query = query.filter(Content.category == category)
        results = query.order_by(Content.view_count.desc()).limit(limit).all()
        return [hydrate_content(item) for item in results]
    except Exception as e:
        print(f"🔥 ERROR in get_content_ranking: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/slug/{slug}", response_model=ContentResponse)
def get_content_by_slug(slug: str, db: Session = Depends(get_db)):
    db_content = db.query(Content).filter(Content.slug == slug).first()
    if not db_content: raise HTTPException(status_code=404, detail="Content not found")
    
    # Calculate Navigation (Prev/Next) within same type and category
    prev_item = db.query(Content).filter(
        Content.type == db_content.type,
        Content.category == db_content.category,
        Content.status == "published",
        Content.created_at < db_content.created_at
    ).order_by(Content.created_at.desc()).first()
    
    next_item = db.query(Content).filter(
        Content.type == db_content.type,
        Content.category == db_content.category,
        Content.status == "published",
        Content.created_at > db_content.created_at
    ).order_by(Content.created_at.asc()).first()
    
    db_content.prev_slug = prev_item.slug if prev_item else None
    db_content.next_slug = next_item.slug if next_item else None

    db_content.view_count = Content.view_count + 1
    db.commit()
    db.refresh(db_content)
    return hydrate_content(db_content)

@router.post("/slug/{slug}/playback")
def record_playback(slug: str, data: PlaybackRecord, db: Session = Depends(get_db)):
    db_content = db.query(Content).filter(Content.slug == slug).first()
    if not db_content: raise HTTPException(status_code=404, detail="Content not found")
    
    db_content.play_time_seconds = Content.play_time_seconds + data.play_time_seconds
    db.commit()
    return {"success": True, "total_seconds": db_content.play_time_seconds}

@router.get("/{content_id}", response_model=ContentResponse)
def get_content(content_id: int, db: Session = Depends(get_db)):
    db_content = db.query(Content).filter(Content.id == content_id).first()
    if not db_content: raise HTTPException(status_code=404, detail="Content not found")

    # Calculate Navigation (Prev/Next)
    prev_item = db.query(Content).filter(
        Content.type == db_content.type,
        Content.category == db_content.category,
        Content.status == "published",
        Content.created_at < db_content.created_at
    ).order_by(Content.created_at.desc()).first()
    
    next_item = db.query(Content).filter(
        Content.type == db_content.type,
        Content.category == db_content.category,
        Content.status == "published",
        Content.created_at > db_content.created_at
    ).order_by(Content.created_at.asc()).first()
    
    db_content.prev_slug = prev_item.slug if prev_item else None
    db_content.next_slug = next_item.slug if next_item else None

    db_content.view_count = Content.view_count + 1
    db.commit()
    db.refresh(db_content)
    return hydrate_content(db_content)

@router.post("", response_model=ContentResponse)
async def create_content(content_data: ContentCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    current_user_id = content_data.author_id if content_data.author_id else 1 
    
    existing_content = db.query(Content).filter(Content.title.ilike(content_data.title), Content.type == content_data.type).first()
    if existing_content:
        raise HTTPException(status_code=400, detail=f"Ya existe un contenido con el título '{content_data.title}'.")
    
    slug = generate_slug(content_data.title, db)
    processed_tags = process_tags(content_data.tags)
    
    if content_data.thumbnail_url and content_data.thumbnail_url.startswith('http'):
        local_path = await download_remote_image(content_data.thumbnail_url, slug)
        if local_path: content_data.thumbnail_url = local_path
    
    content_dict = content_data.model_dump(exclude={'tags', 'author_id'})
    if content_data.type == 'meditation':
        content_dict['category'] = None
        if not content_dict.get('thumbnail_url'): content_dict['thumbnail_url'] = '/static/gallery/articles/meditation_default.webp'
    elif content_data.type == 'article':
        if content_dict.get('category') not in ['yoga', 'therapy']:
            raise HTTPException(status_code=400, detail="Categoría inválida para artículo")
        if not content_dict.get('thumbnail_url'):
            content_dict['thumbnail_url'] = '/static/gallery/articles/om_symbol.webp' if content_dict.get('category') == 'yoga' else '/static/gallery/articles/lotus_flower.webp'

    db_content = Content(**content_dict, slug=slug, tags=processed_tags, author_id=current_user_id)
    sync_content_tags(db, db_content, processed_tags, background_tasks=background_tasks, content_translations=content_data.translations)
    
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    cleanup_orphan_tags(db)
    
    activity_log = DashboardActivity(type='content', action='created', title=f"Nuevo {db_content.type}: {db_content.title}", entity_id=db_content.id)
    db.add(activity_log)
    db.commit()
    
    if db_content.status == "published":
        background_tasks.add_task(notify_n8n_content_change, db_content.id, db_content.type, "create", db=None)
    
    if not content_data.translations and background_tasks:
        fields = {k: v for k, v in {"title": content_data.title, "body": content_data.body, "excerpt": content_data.excerpt, "tags": processed_tags}.items() if v}
        background_tasks.add_task(auto_translate_background, SessionLocal, Content, db_content.id, fields)
        
    return hydrate_content(db_content)

@router.put("/{content_id}", response_model=ContentResponse)
async def update_content(content_id: int, content_data: ContentUpdate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    db_content = db.query(Content).filter(Content.id == content_id).first()
    if not db_content: raise HTTPException(status_code=404, detail="Content not found")
    
    current_slug = db_content.slug
    if content_data.title and content_data.title != db_content.title:
        current_slug = generate_slug(content_data.title, db, content_id)
        db_content.slug = current_slug
    
    if content_data.thumbnail_url and content_data.thumbnail_url.startswith('http') and content_data.thumbnail_url != db_content.thumbnail_url:
        local_path = await download_remote_image(content_data.thumbnail_url, current_slug)
        if local_path: content_data.thumbnail_url = local_path

    content_dict = content_data.model_dump(exclude_unset=True, exclude={'tags'})
    
    # PROTECT TRANSLATIONS: If payload has empty translations but DB has them, do NOT overwrite.
    if 'translations' in content_dict and is_translations_empty(content_dict['translations']):
        if not is_translations_empty(db_content.translations):
            print(f"🛡️ Protecting existing translations for content #{content_id}")
            del content_dict['translations']

    original_status = db_content.status
    # Capture state before applying changes for accurate comparison
    fields_before = {
        "title": (db_content.title or "").strip(),
        "body": (db_content.body or "").strip(),
        "excerpt": (db_content.excerpt or "").strip(),
        "tags": sorted(db_content.tags or []),
        "translations": dict(db_content.translations or {})
    }

    for key, value in content_dict.items(): setattr(db_content, key, value)
    
    if content_data.tags is not None:
        processed_tags = process_tags(content_data.tags)
        db_content.tags = processed_tags
        sync_content_tags(db, db_content, processed_tags, background_tasks=background_tasks)
    
    db.commit()
    db.refresh(db_content)
    cleanup_orphan_tags(db)
    
    if db_content.status == "published":
        background_tasks.add_task(notify_n8n_content_change, db_content.id, db_content.type, "update", db=None)
    
    # Re-translation logic: only if main text fields actually changed AND user didn't provide manual translations
    # We strip whitespace and normalize for comparison to avoid redundant AI calls
    changed_fields = []
    for k in ["title", "body", "excerpt"]:
        current_val = (getattr(db_content, k) or "").strip()
        if current_val != fields_before[k]:
            changed_fields.append(k)
            
    tags_changed = sorted(db_content.tags or []) != fields_before["tags"]
    needs_trans = len(changed_fields) > 0 or tags_changed
    
    # Check if the user EXPLICITLY changed translations in this request compared to before
    manual_trans_change = False
    if content_data.translations is not None:
        trans_before = fields_before["translations"]
        trans_now = content_data.translations or {}
        if trans_now != trans_before:
            manual_trans_change = True
            print(f"DEBUG: Manual translation change detected. Before: {len(trans_before)} keys, Now: {len(trans_now)} keys")
    
    print(f"DEBUG: Content #{content_id} - Needs Trans: {needs_trans}, Manual Change: {manual_trans_change}, Status: {db_content.status}")
    
    if (needs_trans or (not db_content.translations and db_content.status == "published")) and not manual_trans_change:
        print(f"🤖 Triggering auto-translation for content #{content_id} (Changed: {changed_fields})")
        fields = {k: getattr(db_content, k) for k in ["title", "body", "excerpt", "tags"]}
        background_tasks.add_task(auto_translate_background, SessionLocal, Content, db_content.id, {k: v for k, v in fields.items() if v is not None})
    elif manual_trans_change:
        print(f"✍️ Manual translations provided for content #{content_id}, skipping AI.")
        
    return hydrate_content(db_content)

@router.delete("/{content_id}")
async def delete_content(content_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    db_content = db.query(Content).filter(Content.id == content_id).first()
    if not db_content: raise HTTPException(status_code=404, detail="Content not found")
    
    background_tasks.add_task(notify_n8n_content_change, db_content.id, db_content.type, "delete", db=None, entity=db_content)
    db.add(DashboardActivity(type='content', action='deleted', title=db_content.title, entity_id=content_id))
    
    if db_content.thumbnail_url: delete_file(db_content.thumbnail_url)
    if db_content.media_url: delete_file(db_content.media_url)
    
    db.delete(db_content)
    db.commit()
    cleanup_orphan_tags(db)
    return {"message": "Content deleted successfully"}
