
import asyncio
import os
import httpx
from app.core.database import SessionLocal
from app.models.models import Content
# Importamos modelos necesarios para evitar error de importación diferida en webhooks.py
from app.models.models import RAGSyncLog, YogaClassDefinition, MassageType, TherapyType, Activity

async def force_sync_direct():
    db = SessionLocal()
    try:
        content_id = 17
        article = db.query(Content).filter(Content.id == content_id).first()
        
        if article:
            print(f"Found article: {article.title}")
            
            # Construimos el payload manualmente como lo hace webhooks.py
            payload = {
                "id": article.id,
                "type": 'content',
                "action": 'update',
                "log_id": 0,
                "vector_id": article.vector_id or "",
                "data": {
                    "title": article.title,
                    "content": article.body,
                    "slug": article.slug
                }
            }
            
            webhook_url = "http://localhost:5678/webhook/arunachala-rag-update"
            print(f"Sending payload to {webhook_url}...")
            
            async with httpx.AsyncClient() as client:
                resp = await client.post(webhook_url, json=payload, timeout=10.0)
                print(f"Response: {resp.status_code} - {resp.text}")
                
        else:
            print("Article 17 not found")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(force_sync_direct())
