from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime

class ContentBase(BaseModel):
    title: str
    type: str  # 'article', 'meditation', 'mantra', 'service', 'announcement'
    category: Optional[str] = None  # 'yoga', 'therapy'
    body: str
    excerpt: Optional[str] = None
    status: str = "draft"  # 'draft', 'published'
    thumbnail_url: Optional[str] = None
    media_url: Optional[str] = None
    tags: List[str] = []
    author_id: Optional[int] = None
    translations: Optional[Dict[str, Any]] = None

class ContentCreate(ContentBase):
    pass

class ContentUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    category: Optional[str] = None
    body: Optional[str] = None
    excerpt: Optional[str] = None
    status: Optional[str] = None
    thumbnail_url: Optional[str] = None
    media_url: Optional[str] = None
    tags: Optional[List[str]] = None
    author_id: Optional[int] = None
    translations: Optional[Dict[str, Any]] = None

class ContentResponse(ContentBase):
    id: int
    slug: str
    view_count: int
    play_time_seconds: int
    created_at: datetime
    updated_at: Optional[datetime]
    author_name: Optional[str] = None

    class Config:
        from_attributes = True

class PlaybackRecord(BaseModel):
    play_time_seconds: int

class GenerateImageRequest(BaseModel):
    prompt: str
    folder: str = "articles"
