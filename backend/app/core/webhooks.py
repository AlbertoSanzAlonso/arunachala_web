import httpx
import os
import asyncio
from datetime import datetime
from sqlalchemy.orm import Session
from typing import Optional

N8N_WEBHOOK_URL = os.getenv("N8N_RAG_WEBHOOK_URL")

async def notify_n8n_content_change(
    content_id: int, 
    content_type: str, 
    action: str = "update",
    db: Optional[Session] = None
):
    """
    Notifica a n8n cuando cualquier contenido del dashboard cambia.
    También registra la operación en rag_sync_log para tracking.
    
    Args:
        content_id: ID de la entidad
        content_type: Tipo de contenido ('yoga_class', 'massage', 'therapy', 'content', 'activity')
        action: Acción realizada ('create', 'update', 'delete')
        db: Sesión de base de datos (opcional, para logging)
    """
    # Create log entry if db session is provided
    log_id = None
    if db:
        from app.models.models import RAGSyncLog
        try:
            log_entry = RAGSyncLog(
                entity_type=content_type,
                entity_id=content_id,
                action=action,
                status='pending',
                webhook_sent_at=None
            )
            db.add(log_entry)
            db.commit()
            db.refresh(log_entry)
            log_id = log_entry.id
            print(f"✅ Created RAG sync log entry #{log_id} for {content_type} {content_id}")
        except Exception as e:
            print(f"⚠️  Failed to create RAG sync log: {e}")
            db.rollback()
    
    if not N8N_WEBHOOK_URL:
        print(f"⚠️  N8N_WEBHOOK_URL not configured, skipping webhook notification")
        if db and log_id:
            try:
                log_entry = db.query(RAGSyncLog).filter(RAGSyncLog.id == log_id).first()
                if log_entry:
                    log_entry.status = 'failed'
                    log_entry.error_message = 'N8N_WEBHOOK_URL not configured'
                    db.commit()
            except Exception as e:
                print(f"Failed to update log status: {e}")
        return
    
    async def _send():
        from app.models.models import RAGSyncLog
        async with httpx.AsyncClient() as client:
            try:
                # Send webhook
                await client.post(N8N_WEBHOOK_URL, json={
                    "id": content_id,
                    "type": content_type,
                    "action": action,
                    "log_id": log_id  # Include log ID for n8n to update status
                }, timeout=5.0)
                
                print(f"✅ Successfully notified n8n for {content_type} {content_id} ({action})")
                
                # Update log entry
                if db and log_id:
                    try:
                        log_entry = db.query(RAGSyncLog).filter(RAGSyncLog.id == log_id).first()
                        if log_entry:
                            log_entry.webhook_sent_at = datetime.now()
                            log_entry.status = 'processing'
                            db.commit()
                    except Exception as e:
                        print(f"Failed to update log webhook_sent_at: {e}")
                        
            except Exception as e:
                print(f"❌ Error notifying n8n for {content_type} {content_id}: {e}")
                
                # Update log with error
                if db and log_id:
                    try:
                        log_entry = db.query(RAGSyncLog).filter(RAGSyncLog.id == log_id).first()
                        if log_entry:
                            log_entry.status = 'failed'
                            log_entry.error_message = str(e)
                            db.commit()
                    except Exception as update_error:
                        print(f"Failed to update log error: {update_error}")

    # Lo ejecutamos en segundo plano para no bloquear la respuesta de la API
    asyncio.create_task(_send())
