"""
RAG Synchronization API Endpoints
==================================
Endpoints for managing RAG vector database synchronization
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime

from app.core.database import get_db
from app.models.models import (
    RAGSyncLog, YogaClassDefinition, MassageType, 
    TherapyType, Content, Activity, User, Promotion
)
from app.api.auth import get_current_user
from app.core.webhooks import notify_n8n_content_change

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
    articles: Dict
    meditations: Dict
    activities: Dict
    promotions: Dict
    announcements: Dict
    total_needs_reindex: int
    processing_count: int
    latest_success: Optional[Dict] = None


class SyncTriggerRequest(BaseModel):
    """Request to trigger synchronization"""
    # 'yoga', 'massage', 'therapy', 'content', 'activity', 'all'
    sync_type: str = 'all'
    force: bool = False


class ResetMemoryRequest(BaseModel):
    """Request to reset/clear memory"""
    # 'all', 'yoga_class', 'massage', 'therapy', 'content', 'activity'
    scope: str = 'all'


class SyncItemRequest(BaseModel):
    """Request to sync a single item"""
    id: int
    type: str  # 'yoga', 'massage', 'therapy', 'content', 'activity'


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
                log_entry.sync_metadata = request.metadata
            
            db.commit()
    
    # Update entity fields
    entity_model_map = {
        'yoga_class': YogaClassDefinition,
        'massage': MassageType,
        'therapy': TherapyType,
        'content': Content,
        'article': Content,  # Alias for content/article type
        'meditation': Content,
        'activity': Activity,
        'promotion': Promotion,
        'announcement': Content,
    }
    
    Model = entity_model_map.get(request.entity_type)
    if not Model:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown entity type: {request.entity_type}"
        )
    
    entity = db.query(Model).filter(Model.id == request.entity_id).first()
    if not entity:
        # If entity is gone, it's likely it was just deleted. 
        # We don't want to 404 and break n8n or show errors in console.
        return {
            "success": True,
            "message": f"{request.entity_type} #{request.entity_id} not found in DB (likely deleted). Callback accepted.",
            "status": "skipped"
        }
    
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
    
    def get_stats(Model, entity_type: Optional[str] = None):
        query = db.query(Model)
        
        # Only count active items
        if hasattr(Model, 'is_active'):
            query = query.filter(Model.is_active == True)
        elif hasattr(Model, 'status'):
            query = query.filter(Model.status == 'published')
            
        # Add type filter if relevant (e.g. for Content)
        if entity_type and hasattr(Model, 'type'):
            query = query.filter(Model.type == entity_type)
        
        total = query.count()
        
        needs_reindex = query.filter(Model.needs_reindex == True).count()
        vectorized = query.filter(Model.vector_id != None).count()
        
        return {
            "total": total,
            "vectorized": vectorized,
            "needs_reindex": needs_reindex,
            "sync_percentage": round((vectorized / total * 100) if total > 0 else 0, 1)
        }
    
    yoga_stats = get_stats(YogaClassDefinition)
    massage_stats = get_stats(MassageType)
    therapy_stats = get_stats(TherapyType)
    article_stats = get_stats(Content, 'article')
    meditation_stats = get_stats(Content, 'meditation')
    activity_stats = get_stats(Activity)
    promotion_stats = get_stats(Promotion)
    announcement_stats = get_stats(Content, 'announcement')
    
    # Count active sync operations (pending or processing logs in the last 5 mins)
    from datetime import timedelta
    active_syncs = db.query(RAGSyncLog).filter(
        RAGSyncLog.status.in_(['pending', 'processing']),
        RAGSyncLog.created_at >= datetime.now() - timedelta(minutes=5)
    ).count()
    
    total_needs_reindex = (
        yoga_stats['needs_reindex'] +
        massage_stats['needs_reindex'] +
        therapy_stats['needs_reindex'] +
        article_stats['needs_reindex'] +
        meditation_stats['needs_reindex'] +
        activity_stats['needs_reindex'] +
        promotion_stats['needs_reindex'] +
        announcement_stats['needs_reindex']
    )

    # Fetch latest successful sync log for UI notifications
    latest_success_data = None
    try:
        latest_log = db.query(RAGSyncLog).filter(
            RAGSyncLog.status == 'success',
            RAGSyncLog.vectorized_at != None
        ).order_by(desc(RAGSyncLog.vectorized_at)).first()

        if latest_log:
            title = f"{latest_log.entity_type} #{latest_log.entity_id}"
            
            # Try to fetch actual title
            model_map = {
                'yoga_class': YogaClassDefinition,
                'massage': MassageType,
                'therapy': TherapyType,
                'article': Content,  # map 'article' type to Content
                'content': Content,
                'meditation': Content,
                'activity': Activity,
                'promotion': Promotion,
                'announcement': Content,
            }
            # Handle potential mismatch in types (e.g. log 'article', model Content)
            req_type = latest_log.entity_type
            if req_type == 'article' or req_type == 'meditation' or req_type == 'announcement':
                Model = Content
            else:
                Model = model_map.get(req_type)

            if Model:
                entity = db.query(Model).filter(Model.id == latest_log.entity_id).first()
                if entity:
                    if hasattr(entity, 'title') and entity.title:
                        title = entity.title
                    elif hasattr(entity, 'name') and entity.name:
                        title = entity.name

            latest_success_data = {
                "id": latest_log.id,
                "entity_type": latest_log.entity_type,
                "entity_id": latest_log.entity_id,
                "title": title,
                "vectorized_at": latest_log.vectorized_at
            }
    except Exception as e:
        print(f"Error fetching latest sync log: {e}")

    return {
        "yoga_classes": yoga_stats,
        "massage_types": massage_stats,
        "therapy_types": therapy_stats,
        "articles": article_stats,
        "meditations": meditation_stats,
        "activities": activity_stats,
        "promotions": promotion_stats,
        "announcements": announcement_stats,
        "total_needs_reindex": total_needs_reindex,
        "processing_count": active_syncs,
        "latest_success": latest_success_data
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


@router.post("/sync")
async def trigger_rag_sync(
    request: SyncTriggerRequest,
    db: Session = Depends(get_db)
):
    """
    Mananually trigger RAG synchronization for specific types or all content.
    """
    
    model_map = {
        'yoga': (YogaClassDefinition, 'yoga_class', None),
        'massage': (MassageType, 'massage', None),
        'therapy': (TherapyType, 'therapy', None),
        'article': (Content, 'article', 'article'),
        'meditation': (Content, 'meditation', 'meditation'),
        'activity': (Activity, 'activity', None),
        'promotion': (Promotion, 'promotion', None),
        'announcement': (Content, 'announcement', 'announcement'),
    }
    
    types_to_sync = []
    if request.sync_type == 'all':
        types_to_sync = list(model_map.keys())
    elif request.sync_type in model_map:
        types_to_sync = [request.sync_type]
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid sync_type: {request.sync_type}"
        )
    
    sync_total = 0
    
    for s_type in types_to_sync:
        Model, webhook_type, entity_filter = model_map[s_type]
        
        query = db.query(Model)
        
        if not request.force:
            query = query.filter(Model.needs_reindex == True)
        
        # Only active items
        if hasattr(Model, 'is_active'):
            query = query.filter(Model.is_active == True)
        elif hasattr(Model, 'status'):
            query = query.filter(Model.status == 'published')
            
        # Add type filter if relevant
        if entity_filter and hasattr(Model, 'type'):
            query = query.filter(Model.type == entity_filter)
            
        entities = query.all()
        
        for entity in entities:
            # We don't await this to avoid timeout on large batches, 
            # notify_n8n_content_change already handles async background task
            await notify_n8n_content_change(
                content_id=entity.id,
                content_type=webhook_type,
                action='update',
                db=db
            )
            sync_total += 1
    
    return {
        "success": True,
        "triggered_count": sync_total,
        "message": f"Triggered sync for {sync_total} items"
    }


@router.post("/sync-item")
async def trigger_single_item_sync(
    request: SyncItemRequest,
    db: Session = Depends(get_db)
):
    """
    Manually trigger RAG synchronization for a SINGLE item by ID.
    Perfect for immediate indexing after creation.
    """
    model_map = {
        'yoga': (YogaClassDefinition, 'yoga_class'),
        'massage': (MassageType, 'massage'),
        'therapy': (TherapyType, 'therapy'),
        'article': (Content, 'article'),
        'meditation': (Content, 'meditation'),
        'activity': (Activity, 'activity'),
        'promotion': (Promotion, 'promotion'),
        'announcement': (Content, 'announcement'),
    }
    
    if request.type not in model_map:
         raise HTTPException(
             status_code=status.HTTP_400_BAD_REQUEST,
             detail=f"Invalid type: {request.type}. Valid types: {list(model_map.keys())}"
         )
         
    Model, webhook_type = model_map[request.type]
    entity = db.query(Model).filter(Model.id == request.id).first()
    
    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"{request.type} #{request.id} not found"
        )
        
    # Trigger webhook
    await notify_n8n_content_change(
        content_id=entity.id,
        content_type=webhook_type,
        action='update',
        db=db,
        entity=entity
    )
    
    return {
        "success": True, 
        "message": f"Triggered sync for {request.type} #{request.id}",
        "webhook_type": webhook_type
    }


@router.post("/chat-memory-reset")
async def chat_memory_reset(
    request: ResetMemoryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reset RAG memory for specific scope or all content.
    This marks all content in the scope as requiring reindex and resets vector IDs.
    It also notifies n8n to DELETE vectors from the vector store.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para realizar esta acción"
        )

    model_map = {
        'yoga_class': (YogaClassDefinition, 'yoga_class', None),
        'massage': (MassageType, 'massage', None),
        'therapy': (TherapyType, 'therapy', None),
        'article': (Content, 'article', 'article'),
        'meditation': (Content, 'meditation', 'meditation'),
        'activity': (Activity, 'activity', None),
        'promotion': (Promotion, 'promotion', None),
        'announcement': (Content, 'announcement', 'announcement'),
    }

    scopes_to_reset = []
    if request.scope == 'all':
        scopes_to_reset = list(model_map.keys())
    elif request.scope in model_map:
        scopes_to_reset = [request.scope]
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid scope: {request.scope}"
        )

    total_reset = 0
    for s_scope in scopes_to_reset:
        Model, webhook_type, entity_filter = model_map[s_scope]
        
        # Get all entities
        query = db.query(Model)
        if entity_filter and hasattr(Model, 'type'):
            query = query.filter(Model.type == entity_filter)
            
        entities = query.all()
        
        for entity in entities:
            # Notify n8n to DELETE from vector store if it has a vector_id
            if entity.vector_id:
                await notify_n8n_content_change(
                    content_id=entity.id,
                    content_type=webhook_type,
                    action='delete',
                    db=db,
                    entity=entity
                )
            
            # Reset fields in DB
            entity.vector_id = None
            entity.vectorized_at = None
            entity.needs_reindex = True
            total_reset += 1

    db.commit()

    return {
        "success": True,
        "reset_count": total_reset,
        "message": f"Memory reset for {total_reset} items in scope '{request.scope}'"
    }
