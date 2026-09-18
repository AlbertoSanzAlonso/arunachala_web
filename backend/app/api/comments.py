from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models.models import Content, ContentComment, CommentStatus, ContentStatus
from app.schemas.comments import (
    CommentCreate,
    CommentResponse,
    CommentAdminResponse,
    CommentStatusUpdate,
)
from app.api.auth import get_current_admin_user
from app.models.models import User

router = APIRouter(tags=["comments"])


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _get_published_content(content_id: int, db: Session) -> Content:
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Contenido no encontrado")
    if content.status != ContentStatus.PUBLISHED:
        raise HTTPException(status_code=404, detail="Contenido no encontrado")
    return content


@router.get("/api/content/{content_id}/comments", response_model=List[CommentResponse])
def list_public_comments(content_id: int, db: Session = Depends(get_db)):
    """Public: only approved comments for a published content item."""
    _get_published_content(content_id, db)
    return (
        db.query(ContentComment)
        .filter(
            ContentComment.content_id == content_id,
            ContentComment.status == CommentStatus.APPROVED,
        )
        .order_by(ContentComment.created_at.asc())
        .all()
    )


@router.post(
    "/api/content/{content_id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_comment(
    content_id: int,
    payload: CommentCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    """Public: submit a comment (starts as pending for moderation)."""
    _get_published_content(content_id, db)

    comment = ContentComment(
        content_id=content_id,
        author_name=payload.author_name,
        body=payload.body,
        status=CommentStatus.PENDING,
        ip_address=_client_ip(request),
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


@router.get("/api/comments", response_model=List[CommentAdminResponse])
def list_admin_comments(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Admin: list comments, optionally filtered by status."""
    query = (
        db.query(ContentComment, Content)
        .join(Content, ContentComment.content_id == Content.id)
        .order_by(ContentComment.created_at.desc())
    )
    if status_filter:
        if status_filter not in (
            CommentStatus.PENDING,
            CommentStatus.APPROVED,
            CommentStatus.REJECTED,
        ):
            raise HTTPException(status_code=400, detail="Estado inválido")
        query = query.filter(ContentComment.status == status_filter)

    rows = query.all()
    return [
        CommentAdminResponse(
            id=comment.id,
            content_id=comment.content_id,
            author_name=comment.author_name,
            body=comment.body,
            status=comment.status,
            created_at=comment.created_at,
            content_title=content.title,
            content_slug=content.slug,
            content_type=content.type,
        )
        for comment, content in rows
    ]


@router.get("/api/comments/pending-count")
def pending_comments_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Admin: count of pending comments for sidebar badge."""
    count = (
        db.query(ContentComment)
        .filter(ContentComment.status == CommentStatus.PENDING)
        .count()
    )
    return {"count": count}


@router.patch("/api/comments/{comment_id}", response_model=CommentResponse)
def update_comment_status(
    comment_id: int,
    payload: CommentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Admin: approve or reject a comment."""
    comment = db.query(ContentComment).filter(ContentComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comentario no encontrado")

    comment.status = payload.status
    db.commit()
    db.refresh(comment)
    return comment


@router.delete("/api/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Admin: permanently delete a comment."""
    comment = db.query(ContentComment).filter(ContentComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comentario no encontrado")

    db.delete(comment)
    db.commit()
    return None
