from fastapi import APIRouter, Depends
from app.core.config import settings
from app.core.translation_utils import get_openai_client

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
