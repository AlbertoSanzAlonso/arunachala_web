from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import datetime


class CommentCreate(BaseModel):
    author_name: str = Field(..., min_length=2, max_length=80)
    body: str = Field(..., min_length=2, max_length=2000)

    @field_validator("author_name", "body")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("El campo no puede estar vacío")
        return cleaned


class CommentResponse(BaseModel):
    id: int
    content_id: int
    author_name: str
    body: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class CommentAdminResponse(CommentResponse):
    content_title: Optional[str] = None
    content_slug: Optional[str] = None
    content_type: Optional[str] = None


class CommentStatusUpdate(BaseModel):
    status: Literal["approved", "rejected"]
