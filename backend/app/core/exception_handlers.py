from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
import traceback
from app.core.config import settings

async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all for any unhandled exceptions, ensuring CORS and logging"""
    # Log the error
    print(f"🔥 Global Exception: {type(exc).__name__}: {exc}")
    traceback.print_exc()
    
    status_code = 500
    detail = "Internal Server Error"
    
    # Handle specific DB errors
    if isinstance(exc, IntegrityError):
        status_code = 400
        detail = "Error de integridad: Es posible que ya exista un elemento con este nombre."
    
    response = JSONResponse(
        status_code=status_code,
        content={"detail": detail}
    )
    
    # Manually add CORS headers (needed for exceptions)
    _add_cors_headers(request, response)
    
    return response

async def http_exception_handler(request: Request, exc: HTTPException):
    """Standardize HTTPException responses with CORS"""
    response = JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )
    _add_cors_headers(request, response)
    return response

def _add_cors_headers(request: Request, response: JSONResponse):
    """Helper to inject CORS headers manually for exception responses"""
    origin = request.headers.get("origin")
    allowed = settings.ALLOWED_ORIGINS if isinstance(settings.ALLOWED_ORIGINS, list) else []
    
    if origin and (origin in allowed or ".vercel.app" in origin or "localhost" in origin):
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
