from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os

from app.core.database import engine, get_db
from app.models import models
from app.core.config import settings
from app.core.redis_cache import cache
from app.core.scheduler import start_scheduler, stop_scheduler
from app.core.exception_handlers import global_exception_handler, http_exception_handler

# Import Routers
from app.api import (
    reviews, auth, gallery, schedules, yoga_classes, treatments, 
    content, activities, upload, dashboard, rag, legacy, tags, 
    automation, suggestions, site_config, subscriptions, promotions, 
    announcements, seo, mantras, debug
)
from app.routers import chat

# Initialize Tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Arunachala API")

# --- Middleware & Exception Handlers ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS or [
        "http://localhost:3000", "http://localhost:3001", 
        "https://arunachala-web.vercel.app"
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(Exception, global_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)

# --- Lifespan Events ---
@app.on_event("startup")
async def startup_event():
    # Run migrations/initialization if needed
    from sqlalchemy import text
    with engine.connect() as conn:
        for col_query in [
            "ALTER TABLE contents ADD COLUMN view_count INTEGER DEFAULT 0;",
            "ALTER TABLE contents ADD COLUMN play_time_seconds INTEGER DEFAULT 0;",
            "ALTER TABLE mantras ADD COLUMN translations JSONB;"
        ]:
            try:
                conn.execute(text(col_query))
                conn.commit()
            except Exception: pass

    # Connect Redis
    await cache.connect()

    # Start Automation Scheduler
    start_scheduler()

@app.on_event("shutdown")
async def shutdown_event():
    await cache.disconnect()
    stop_scheduler()

# --- Routes & Routers ---
app.include_router(reviews.router, prefix="/api", tags=["reviews"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(gallery.router, prefix="/api/gallery", tags=["gallery"])
app.include_router(schedules.router)
app.include_router(yoga_classes.router)
app.include_router(treatments.router)
app.include_router(content.router)
app.include_router(activities.router)
app.include_router(upload.router)
app.include_router(dashboard.router)
app.include_router(legacy.router)
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(rag.router)
app.include_router(automation.router)
app.include_router(suggestions.router)
app.include_router(site_config.router)
app.include_router(subscriptions.router, prefix="/api/subscriptions")
app.include_router(subscriptions.router, prefix="/api/subscription")
app.include_router(promotions.router, prefix="/api/promotions")
app.include_router(promotions.router, prefix="/api/promotion")
app.include_router(announcements.router, prefix="/api/announcements")
app.include_router(announcements.router, prefix="/api/announcement")
app.include_router(tags.router, prefix="/api/tags", tags=["tags"])
app.include_router(seo.router)
app.include_router(mantras.router, prefix="/api/mantras", tags=["mantras"])
app.include_router(debug.router, prefix="/api/debug", tags=["debug"])

# Static Files
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
def read_root():
    return {"message": "Welcome to Arunachala API"}

@app.get("/sitemap.xml")
async def root_sitemap(db: Session = Depends(get_db)):
    """Proxy to the actual sitemap logic in SEO module for root access"""
    from app.api.seo import sitemap
    return await sitemap(db)
