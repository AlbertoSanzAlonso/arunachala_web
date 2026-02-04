"""
RAG Synchronization API Endpoints
==================================
Endpoints for managing RAG vector database synchronization
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime

from app.core.database import get_db
from app.models.models import (
    RAGSyncLog, YogaClassDefinition, MassageType, 
    TherapyType, Content, Activity
)

router = APIRouter(prefix="/api/rag", tags=["RAG Sync"])


class SyncCallbackRequest(BaseModel):
    """Request from n8n after vectorization"""
    log_id: Optional[int] = None
    entity_type: str  # 'yoga_class', 'massage', 'therapy', 'content', 'activity'
    entity_id: int
    vector_id: Optional[str] = None
    status: str  # 'success' or 'failed'
    error_message: Optional[str] = None
    metadata: Optional[Dict] = None


class SyncStatusResponse(BaseModel):
    """Response with sync status for all content types"""
    yoga_classes: Dict
    massage_types: Dict
    therapy_types: Dict
    contents: Dict
    activities: Dict
    total_needs_reindex: int


@router.post("/sync-callback")
async def rag_sync_callback(
    request: SyncCallbackRequest,
    db: Session = Depends(get_db)
):
    """
    Callback endpoint for n8n to report vectorization status.
    This updates the sync log and the entity's RAG tracking fields.
    """
    
    # Update sync log if log_id provided
    if request.log_id:
        log_entry = db.query(RAGSyncLog).filter(RAGSyncLog.id == request.log_id).first()
        if log_entry:
            log_entry.status = request.status
            log_entry.vector_id = request.vector_id
            log_entry.error_message = request.error_message
            
            if request.status == 'success':
                log_entry.vectorized_at = datetime.now()
            
            if request.metadata:
                log_entry.metadata = request.metadata
            
            db.commit()
    
    # Update entity fields
    entity_model_map = {
        'yoga_class': YogaClassDefinition,
        'massage': MassageType,
        'therapy': TherapyType,
        'content': Content,
        'activity': Activity,
    }
    
    Model = entity_model_map.get(request.entity_type)
    if not Model:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown entity type: {request.entity_type}"
        )
    
    entity = db.query(Model).filter(Model.id == request.entity_id).first()
    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{request.entity_type} #{request.entity_id} not found"
        )
    
    # Update RAG tracking fields
    if request.status == 'success':
        entity.vector_id = request.vector_id
        entity.vectorized_at = datetime.now()
        entity.needs_reindex = False
    else:
        # If failed, keep needs_reindex = True for retry
        entity.needs_reindex = True
    
    db.commit()
    
    return {
        "success": True,
        "message": f"Updated {request.entity_type} #{request.entity_id}",
        "status": request.status
    }


@router.get("/sync-status", response_model=SyncStatusResponse)
async def get_sync_status(db: Session = Depends(get_db)):
    """
    Get detailed synchronization status for all content types.
    Useful for dashboard monitoring.
    """
    
    def get_stats(Model):
        total_query = db.query(Model)
        
        # Only count active items
        if hasattr(Model, 'is_active'):
            total_query = total_query.filter(Model.is_active == True)
        elif hasattr(Model, 'status'):
            total_query = total_query.filter(Model.status == 'published')
        
        total = total_query.count()
        
        needs_reindex = total_query.filter(Model.needs_reindex == True).count()
        vectorized = total_query.filter(Model.vector_id != None).count()
        
        return {
            "total": total,
            "vectorized": vectorized,
            "needs_reindex": needs_reindex,
            "sync_percentage": round((vectorized / total * 100) if total > 0 else 0, 1)
        }
    
    yoga_stats = get_stats(YogaClassDefinition)
    massage_stats = get_stats(MassageType)
    therapy_stats = get_stats(TherapyType)
    content_stats = get_stats(Content)
    activity_stats = get_stats(Activity)
    
    total_needs_reindex = (
        yoga_stats['needs_reindex'] +
        massage_stats['needs_reindex'] +
        therapy_stats['needs_reindex'] +
        content_stats['needs_reindex'] +
        activity_stats['needs_reindex']
    )
    
    return {
        "yoga_classes": yoga_stats,
        "massage_types": massage_stats,
        "therapy_types": therapy_stats,
        "contents": content_stats,
        "activities": activity_stats,
        "total_needs_reindex": total_needs_reindex
    }


@router.get("/sync-logs")
async def get_sync_logs(
    limit: int = 50,
    entity_type: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get recent sync logs with optional filtering.
    Useful for debugging and monitoring.
    """
    
    query = db.query(RAGSyncLog).order_by(RAGSyncLog.created_at.desc())
    
    if entity_type:
        query = query.filter(RAGSyncLog.entity_type == entity_type)
    
    if status_filter:
        query = query.filter(RAGSyncLog.status == status_filter)
    
    logs = query.limit(limit).all()
    
    return {
        "total": len(logs),
        "logs": [
            {
                "id": log.id,
                "entity_type": log.entity_type,
                "entity_id": log.entity_id,
                "action": log.action,
                "status": log.status,
                "vector_id": log.vector_id,
                "error_message": log.error_message,
                "webhook_sent_at": log.webhook_sent_at,
                "vectorized_at": log.vectorized_at,
                "created_at": log.created_at,
            }
            for log in logs
        ]
    }
