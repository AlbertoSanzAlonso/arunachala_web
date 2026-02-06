import httpx
import os
import asyncio
from datetime import datetime
from sqlalchemy.orm import Session
from typing import Optional, Any
from app.core.database import SessionLocal

N8N_WEBHOOK_URL = os.getenv("N8N_RAG_WEBHOOK_URL")

async def notify_n8n_content_change(
    content_id: int, 
    content_type: str, 
    action: str = "update",
    db: Optional[Session] = None, # Kept for backward compatibility but using SessionLocal
    entity: Optional[Any] = None
):
    """
    Notifica a n8n cuando cualquier contenido del dashboard cambia.
    También registra la operación en rag_sync_log para tracking.
    """
    # Create log entry using a fresh session to avoid transaction conflicts
    log_id = None
    internal_db = SessionLocal()
    
    # Pre-fetch entity data to include in payload
    # Usaremos un diccionario plano para máxima compatibilidad con n8n
    flat_payload = {}
    
    try:
        from app.models.models import (
            RAGSyncLog, Content, YogaClassDefinition, 
            MassageType, TherapyType, Activity
        )
        
        # Mapping for fetching entity if not provided
        entity_map = {
            'content': Content,
            'article': Content,
            'yoga_class': YogaClassDefinition,
            'massage': MassageType,
            'therapy': TherapyType,
            'activity': Activity
        }
        
        # If entity not provided, fetch it
        db_entity = entity
        if not db_entity and action != 'delete' and content_type in entity_map:
            Model = entity_map[content_type]
            db_entity = internal_db.query(Model).filter(Model.id == content_id).first()
            
        # Extract useful data for RAG (FLAT STRUCTURE)
        if db_entity:
            if hasattr(db_entity, 'title'):
                flat_payload['title'] = db_entity.title
            elif hasattr(db_entity, 'name'):
                flat_payload['title'] = db_entity.name
                
            if hasattr(db_entity, 'body'):
                flat_payload['content'] = db_entity.body
            elif hasattr(db_entity, 'description'):
                flat_payload['content'] = db_entity.description
                
            # Fallback for empty content
            if not flat_payload.get('content'):
                flat_payload['content'] = getattr(db_entity, 'excerpt', '') or ''
                
            # Add url/slug if available
            if hasattr(db_entity, 'slug'):
                flat_payload['slug'] = db_entity.slug
                
            # Add extra metadata
            if hasattr(db_entity, 'category'):
                flat_payload['category'] = db_entity.category

        # Create Log
        log_entry = RAGSyncLog(
            entity_type=content_type,
            entity_id=content_id,
            action=action,
            status='pending',
            webhook_sent_at=None
        )
        internal_db.add(log_entry)
        internal_db.commit()
        internal_db.refresh(log_entry)
        log_id = log_entry.id
        print(f"✅ Created RAG sync log entry #{log_id} for {content_type} {content_id}")
        
    except Exception as e:
        print(f"⚠️  Failed to create RAG sync log or fetch data: {e}")
        internal_db.rollback()
    finally:
        internal_db.close()
    
    if not N8N_WEBHOOK_URL:
        print(f"⚠️  N8N_WEBHOOK_URL not configured, skipping webhook notification")
        # Log failure logic omitted for brevity
        return
    
    
    async def _send(l_id, v_id, e_data):
        from app.models.models import RAGSyncLog
        async with httpx.AsyncClient() as client:
            try:
                # Send webhook with FLAT DATA so n8n maps keys automatically
                payload = {
                    "id": content_id,
                    "type": content_type,
                    "action": action,
                    "log_id": l_id or 0,
                    "vector_id": v_id or "",
                    **e_data # Merge entity data at root level
                }
                
                # Also include 'data' nested object for backward compatibility if needed
                payload['data'] = e_data
                
                await client.post(N8N_WEBHOOK_URL, json=payload, timeout=10.0)
                print(f"✅ Successfully notified n8n for {content_type} {content_id} ({action}) with log_id={l_id}")
                
                # Update log entry with its own session
                if l_id:
                    db_bg = SessionLocal()
                    try:
                        log_entry = db_bg.query(RAGSyncLog).filter(RAGSyncLog.id == l_id).first()
                        if log_entry:
                            log_entry.webhook_sent_at = datetime.now()
                            log_entry.status = 'processing'
                            db_bg.commit()
                    finally:
                        db_bg.close()
                        
            except Exception as e:
                print(f"❌ Error notifying n8n for {content_type} {content_id}: {e}")
                # Log failure logic omitted for brevity

    # Get vector_id safely
    vector_id = None
    if entity and hasattr(entity, 'vector_id'):
        vector_id = entity.vector_id

    # Execute async
    asyncio.create_task(_send(log_id, vector_id, flat_payload))

    # Direct delete from Qdrant if action is delete (remains same)
    if action == 'delete':
        try:
            from qdrant_client import QdrantClient
            from qdrant_client.http import models as rest
            import hashlib
            
            q_client = QdrantClient(url="http://localhost:6333")
            unique_str = f"{content_type}_{content_id}"
            point_id = hashlib.md5(unique_str.encode()).hexdigest()
                
            if point_id:
                q_client.delete(
                    collection_name="arunachala_knowledge_base",
                    points_selector=rest.PointIdsList(points=[point_id])
                )
                print(f"✅ Deleted Qdrant Point ID {point_id} directly.")
                
        except Exception as q_e:
            print(f"⚠️  Direct Qdrant deletion failed: {q_e}")
