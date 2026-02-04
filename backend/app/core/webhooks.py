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
    \"\"\"
    Notifica a n8n cuando cualquier contenido del dashboard cambia.
    También registra la operación en rag_sync_log para tracking.
    \"\"\"
    # Create log entry using a fresh session to avoid transaction conflicts
    log_id = None
    internal_db = SessionLocal()
    try:
        from app.models.models import RAGSyncLog
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
        print(f"⚠️  Failed to create RAG sync log: {e}")
        internal_db.rollback()
    finally:
        internal_db.close()
    
    if not N8N_WEBHOOK_URL:
        print(f"⚠️  N8N_WEBHOOK_URL not configured, skipping webhook notification")
        if log_id:
            db_err = SessionLocal()
            try:
                from app.models.models import RAGSyncLog
                log_entry = db_err.query(RAGSyncLog).filter(RAGSyncLog.id == log_id).first()
                if log_entry:
                    log_entry.status = 'failed'
                    log_entry.error_message = 'N8N_WEBHOOK_URL not configured'
                    db_err.commit()
            finally:
                db_err.close()
        return
    
    # Prepare additional data if entity is provided
    vector_id = getattr(entity, 'vector_id', None) if entity else None
    
    async def _send(l_id, v_id):
        from app.models.models import RAGSyncLog
        async with httpx.AsyncClient() as client:
            try:
                # Send webhook with more data to help n8n skip GET requests on delete
                # We use 0 if log_id is None to avoid 'null' which trips some n8n nodes
                payload = {
                    "id": content_id,
                    "type": content_type,
                    "action": action,
                    "log_id": l_id or 0,
                    "vector_id": v_id or ""
                }
                
                await client.post(N8N_WEBHOOK_URL, json=payload, timeout=7.0)
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
                
                # Update log with error
                if l_id:
                    db_err = SessionLocal()
                    try:
                        log_entry = db_err.query(RAGSyncLog).filter(RAGSyncLog.id == l_id).first()
                        if log_entry:
                            log_entry.status = 'failed'
                            log_entry.error_message = str(e)
                            db_err.commit()
                    finally:
                        db_err.close()

    # Lo ejecutamos en segundo plano para no bloquear la respuesta de la API
    # Pasamos el log_id actual para asegurar que no sea null por temas de cierre
    asyncio.create_task(_send(log_id, vector_id))

