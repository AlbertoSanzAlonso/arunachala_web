import httpx
import os
import asyncio

N8N_WEBHOOK_URL = os.getenv("N8N_RAG_WEBHOOK_URL")

async def notify_n8n_content_change(content_id: int, content_type: str, action: str = "update"):
    """
    Notifica a n8n cuando cualquier contenido del dashboard cambia.
    content_type puede ser: 'yoga_class', 'therapy', 'event', 'article', etc.
    """
    if not N8N_WEBHOOK_URL:
        return
    
    async def _send():
        async with httpx.AsyncClient() as client:
            try:
                await client.post(N8N_WEBHOOK_URL, json={
                    "id": content_id,
                    "type": content_type,
                    "action": action
                }, timeout=5.0)
            except Exception as e:
                print(f"Error notifying n8n for {content_type} {content_id}: {e}")

    # Lo ejecutamos en segundo plano para no bloquear la respuesta de la API
    asyncio.create_task(_send())
