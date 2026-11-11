from fastapi import APIRouter, Depends
from app.core.config import settings
from app.core.translation_utils import get_openai_client
from app.services.email import email_service

router = APIRouter()

@router.get("/check-ai-config")
async def check_ai_config():
    """Debug endpoint to check if AI configuration is correct."""
    has_key = bool(settings.OPENAI_API_KEY)
    key_prefix = settings.OPENAI_API_KEY[:8] + "..." if has_key else None
    
    client = get_openai_client()
    client_ok = client is not None
    
    return {
        "openai_api_key_set": has_key,
        "key_prefix": key_prefix,
        "client_initialized": client_ok,
        "model_configured": "gpt-4o-mini"
    }


@router.get("/check-mail-config")
async def check_mail_config():
    """Debug endpoint: SMTP configured? (no secrets)."""
    return {
        "smtp_configured": email_service.use_smtp,
        "mail_server_set": bool(email_service.mail_server),
        "mail_port": email_service.mail_port,
        "mail_username_set": bool(email_service.mail_username),
        "mail_password_set": bool(email_service.mail_password),
        "mail_from_set": bool(email_service.mail_from or email_service.mail_username),
        "notify_recipients": email_service.contact_emails,
    }
