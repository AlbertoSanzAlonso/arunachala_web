"""Notificaciones a buscadores al publicar contenido."""
import os
from typing import Literal, Optional

import httpx
from googleapiclient.discovery import build

from app.core.google_auth import get_google_credentials
from app.models.models import Content
from app.services.html_prerender import content_public_url

INDEXING_SCOPE = ["https://www.googleapis.com/auth/indexing"]
VERCEL_DEPLOY_HOOK_URL = os.getenv("VERCEL_DEPLOY_HOOK_URL")


async def request_google_indexing(
    url: str,
    notification_type: Literal["URL_UPDATED", "URL_DELETED"] = "URL_UPDATED",
) -> dict:
    """
    Envía una notificación a Google Indexing API.
    Requiere que la service account sea propietaria en Search Console.
    """
    creds = get_google_credentials(INDEXING_SCOPE)
    if not creds:
        print("Indexing API: credenciales no configuradas, omitiendo.")
        return {"status": "not_configured", "url": url}

    try:
        service = build("indexing", "v3", credentials=creds, cache_discovery=False)
        body = {"url": url, "type": notification_type}
        response = service.urlNotifications().publish(body=body).execute()
        print(f"Indexing API: {notification_type} → {url} → {response}")
        return {"status": "success", "url": url, "response": response}
    except Exception as exc:
        print(f"Indexing API: error para {url}: {exc}")
        return {"status": "error", "url": url, "message": str(exc)}


async def trigger_vercel_rebuild() -> dict:
    """Opcional: dispara un nuevo deploy en Vercel para regenerar HTML estático."""
    if not VERCEL_DEPLOY_HOOK_URL:
        return {"status": "not_configured"}

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(VERCEL_DEPLOY_HOOK_URL)
            print(f"Vercel deploy hook: {response.status_code}")
            return {"status": "success", "code": response.status_code}
    except Exception as exc:
        print(f"Vercel deploy hook error: {exc}")
        return {"status": "error", "message": str(exc)}


async def notify_url_deleted(url: str) -> dict:
    """Notifica a Google que una URL fue eliminada."""
    return await request_google_indexing(url, "URL_DELETED")


async def notify_search_engines_on_publish(
    content: Content,
    action: Literal["publish", "update", "delete"] = "publish",
    *,
    trigger_rebuild: bool = False,
) -> None:
    """
    Notifica a Google cuando se publica, actualiza o elimina contenido indexable.
    Ejecutar en background task tras commit en BD.
    """
    public_url = content_public_url(content)

    if action == "delete":
        if not public_url:
            return
        await request_google_indexing(public_url, "URL_DELETED")
        return

    if content.status != "published" or not public_url:
        return

    if content.type not in ("article", "meditation"):
        return

    await request_google_indexing(public_url, "URL_UPDATED")

    if trigger_rebuild:
        await trigger_vercel_rebuild()


async def notify_search_engines_by_id(
    content_id: int,
    action: Literal["publish", "update", "delete"] = "publish",
    *,
    trigger_rebuild: bool = False,
    entity: Optional[Content] = None,
) -> None:
    """Wrapper que abre su propia sesión de BD para background tasks."""
    from app.core.database import SessionLocal

    if action == "publish" and os.getenv("VERCEL_DEPLOY_HOOK_ON_PUBLISH", "").lower() in (
        "1",
        "true",
        "yes",
    ):
        trigger_rebuild = True

    db = SessionLocal()
    try:
        item = entity
        if not item and action != "delete":
            item = db.query(Content).filter(Content.id == content_id).first()
        elif not item and action == "delete":
            # Para delete, entity debe pasarse antes del borrado
            return
        if item:
            await notify_search_engines_on_publish(
                item, action, trigger_rebuild=trigger_rebuild
            )
    finally:
        db.close()
