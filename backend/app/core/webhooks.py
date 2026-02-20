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
            MassageType, TherapyType, Activity, Promotion
        )
        
        # Mapping for fetching entity if not provided
        entity_map = {
            'content': Content,
            'article': Content,
            'meditation': Content,
            'yoga_class': YogaClassDefinition,
            'massage': MassageType,
            'therapy': TherapyType,
            'activity': Activity,
            'promotion': Promotion
        }
        
        # If entity not provided, fetch it
        db_entity = entity
        if not db_entity and action != 'delete' and content_type in entity_map:
            Model = entity_map[content_type]
            db_entity = internal_db.query(Model).filter(Model.id == content_id).first()
            
        # Extract useful data for RAG (FLAT STRUCTURE)
        if db_entity:
            import re
            
            # Extract title - ensure it's a non-empty string
            if hasattr(db_entity, 'title') and db_entity.title:
                flat_payload['title'] = str(db_entity.title).strip()
            elif hasattr(db_entity, 'name') and db_entity.name:
                flat_payload['title'] = str(db_entity.name).strip()
            else:
                flat_payload['title'] = f"Entity {content_id}"  # Fallback title
                
            # Extract content/description
            if hasattr(db_entity, 'body') and db_entity.body:
                flat_payload['content'] = str(db_entity.body).strip()
            elif hasattr(db_entity, 'description') and db_entity.description:
                flat_payload['content'] = str(db_entity.description).strip()
                
                # Special handling for Promotion to include discount info
                if content_type == 'promotion':
                    prom_extras = []
                    if getattr(db_entity, 'discount_code', None):
                        prom_extras.append(f"Código: {db_entity.discount_code}")
                    if getattr(db_entity, 'discount_percentage', None):
                        prom_extras.append(f"Descuento: {db_entity.discount_percentage}%")
                    
                    if prom_extras:
                        flat_payload['content'] += "\n\n" + " - ".join(prom_extras)
            else:
                flat_payload['content'] = ""
                
            # Ensure content is never empty
            if not flat_payload.get('content'):
                flat_payload['content'] = f"{flat_payload.get('title', 'Content')}"
                
            # CRITICAL: Add url/slug - ALWAYS GENERATE if missing or null
            title_for_slug = flat_payload.get('title', f'entity-{content_id}')
            
            # First try to use existing slug
            if hasattr(db_entity, 'slug') and db_entity.slug and db_entity.slug.strip():
                flat_payload['slug'] = str(db_entity.slug).strip()
            else:
                # Generate slug from title
                generated_slug = re.sub(r'[^\w\s-]', '', str(title_for_slug).lower())
                generated_slug = re.sub(r'[-\s]+', '-', generated_slug).strip('-')
                flat_payload['slug'] = generated_slug or f'entity-{content_id}'
                print(f"⚠️  Generated slug for {content_type} {content_id}: '{flat_payload['slug']}'")
                
            # Add extra metadata
            if hasattr(db_entity, 'category') and db_entity.category:
                flat_payload['category'] = str(db_entity.category).strip()

            # Add tags if available (critical for search)
            if hasattr(db_entity, 'tags') and db_entity.tags:
                # If tags is a list, join it; if string, keep it.
                t = db_entity.tags
                if isinstance(t, list):
                    flat_payload['tags'] = ", ".join(str(tag) for tag in t if tag)
                else:
                    flat_payload['tags'] = str(t)

            # CRITICAl: Prepend Title to Content for better RAG Context
            # This ensures the AI always knows the title of the article/class
            if flat_payload.get('title') and flat_payload.get('content'):
                flat_payload['content'] = f"# {flat_payload['title']}\n\n{flat_payload['content']}"

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
        import re
        async with httpx.AsyncClient() as client:
            try:
                # STEP 1: SANITIZE - Remove None/empty values and ensure all strings are non-empty
                sanitized_data = {}
                for key, value in e_data.items():
                    # Skip None and empty string values
                    if value is None or value == "":
                        continue
                    
                    # Convert to string and strip if needed
                    if isinstance(value, str):
                        clean_value = value.strip()
                        if clean_value:  # Only add if non-empty after strip
                            sanitized_data[key] = clean_value
                    else:
                        sanitized_data[key] = value
                
                # STEP 2: ENSURE CRITICAL FIELDS - NEVER ALLOW NULL/EMPTY
                # Title is mandatory
                if 'title' not in sanitized_data or not sanitized_data['title']:
                    sanitized_data['title'] = f"Entity {content_id}"
                
                # Content is mandatory
                if 'content' not in sanitized_data or not sanitized_data['content']:
                    sanitized_data['content'] = sanitized_data.get('title', f'Entity {content_id}')
                
                # SLUG is mandatory - GENERATE IF MISSING
                if 'slug' not in sanitized_data or not sanitized_data['slug']:
                    title_str = sanitized_data.get('title', f'entity-{content_id}')
                    # Generate slug: lowercase, remove non-word chars, replace spaces with hyphens
                    generated_slug = re.sub(r'[^\w\s-]', '', str(title_str).lower())
                    generated_slug = re.sub(r'[-\s]+', '-', generated_slug).strip('-')
                    sanitized_data['slug'] = generated_slug or f'entity-{content_id}'
                
                # STEP 3: BUILD PAYLOAD with sanitized data
                payload = {
                    "id": content_id,
                    "type": content_type,
                    "action": action,
                    "log_id": l_id or 0,
                    "vector_id": v_id or "",
                    **sanitized_data  # Merge entity data at root level
                }
                
                # Also include 'data' nested object for backward compatibility if needed
                payload['data'] = sanitized_data
                
                print(f"📤 Sending webhook payload for {content_type} {content_id}:")
                print(f"   title: '{sanitized_data.get('title')}'")
                print(f"   slug: '{sanitized_data.get('slug')}'")
                print(f"   content preview: '{sanitized_data.get('content')[:100] if sanitized_data.get('content') else 'N/A'}'")
                print(f"   Full payload keys: {list(payload.keys())}")
                
                response = await client.post(N8N_WEBHOOK_URL, json=payload, timeout=10.0)
                print(f"   n8n response status: {response.status_code}")
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
                import traceback
                traceback.print_exc()
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
