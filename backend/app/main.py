from dotenv import load_dotenv
load_dotenv()


# Trigger reload
from fastapi import FastAPI, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base, get_db
from app.models import models
from app.models.models import Content, Activity
from sqlalchemy.orm import Session
from datetime import datetime
import os

from app.api import reviews, auth, gallery, schedules, yoga_classes, treatments, content, activities, upload, dashboard, rag, legacy, tags, automation, suggestions, site_config, subscriptions, promotions, announcements, seo, mantras, debug
from app.routers import chat
from fastapi.staticfiles import StaticFiles

# Create Tables
models.Base.metadata.create_all(bind=engine)

from app.core.config import settings

app = FastAPI(title="Arunachala API")

# Background Scheduler for Automation Tasks (APScheduler)
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.core.database import SessionLocal
from app.models.models import AutomationTask
from datetime import datetime
import httpx
import os

async def check_automation_tasks():
    """Job that runs every minute to check and trigger scheduled tasks"""
    N8N_YOGA_WEBHOOK_URL = os.getenv("N8N_YOGA_BLOG_WEBHOOK_URL", "http://localhost:5678/webhook/arunachala-blog-yoga")
    N8N_THERAPY_WEBHOOK_URL = os.getenv("N8N_THERAPY_BLOG_WEBHOOK_URL", "http://localhost:5678/webhook/arunachala-blog-therapy")
    
    db = SessionLocal()
    try:
        from zoneinfo import ZoneInfo
        MADRID_TZ = ZoneInfo("Europe/Madrid")
        # For trigger matching (Spain local time)
        now_madrid = datetime.now(MADRID_TZ)
        current_day = str(now_madrid.isoweekday() % 7) # 0=Sunday, 1=Monday...
        current_time = now_madrid.strftime("%H:%M")
        
        # For DB timestamp persistence
        now_naive = datetime.now()
        
        # Find active tasks that match current day and time
        tasks = db.query(AutomationTask).filter(
            AutomationTask.is_active == True,
            AutomationTask.schedule_time == current_time
        ).all()
        
        for task in tasks:
            days = task.schedule_days.split(',') if task.schedule_days else []
            if current_day in days:
                # Normalizar task.last_run a naive/timezone-aware para poder comparar
                should_run = True
                if task.last_run:
                    # task.last_run viede de la DB, que PostgreSQL guarda como Aware (UTC)
                    # Convertimos now_madrid al mismo formato o usamos timedelta seguro
                    try:
                        # Si `task.last_run` es aware, `now_utc` debe ser aware:
                        now_utc_aware = datetime.now(ZoneInfo("UTC"))
                        delta = (now_utc_aware - task.last_run).total_seconds()
                        if abs(delta) < 60:
                            should_run = False
                    except TypeError:
                        # Si era naive por algún motivo
                        delta = (datetime.utcnow() - task.last_run).total_seconds()
                        if abs(delta) < 60:
                            should_run = False
                            
                if should_run:
                    print(f"⏰ APScheduler Trigger: {task.name} ({task.category})")
                    
                    async with httpx.AsyncClient() as client:
                        payload = {
                            "action": "generate",
                            "task_type": task.task_type,
                            "category": task.category,
                            "triggered_by": "system_apscheduler",
                            "timestamp": datetime.utcnow().isoformat()
                        }
                        try:
                            webhook_url = N8N_THERAPY_WEBHOOK_URL if task.category == "therapy" else N8N_YOGA_WEBHOOK_URL
                            print(f"📡 Sending CRON trigger to {webhook_url} con payload: {payload}")
                            response = await client.post(webhook_url, json=payload, timeout=15.0)
                            
                            if response.status_code >= 400:
                                raise Exception(f"N8N Error {response.status_code}: {response.text}")
                                
                            task.last_run = datetime.utcnow()
                            db.commit()
                            print(f"✅ Successfully triggered scheduled task: {task.name} - Respuesta N8N: {response.text}")
                        except Exception as e:
                            print(f"❌ Failed to trigger scheduled task {task.name}: {e}")
                            
    except Exception as e:
        print(f"⚠️ Scheduler Execution Error: {e}")
    finally:
        db.close()

scheduler = AsyncIOScheduler()

@app.on_event("startup")
async def startup_event():
    # --- DB Migration for View Tracking ---
    try:
        from sqlalchemy import text
        from app.core.database import engine
        with engine.connect() as conn:
            try:
                conn.execute(text("ALTER TABLE contents ADD COLUMN view_count INTEGER DEFAULT 0;"))
                conn.commit()
                print("✅ view_count column added")
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE contents ADD COLUMN play_time_seconds INTEGER DEFAULT 0;"))
                conn.commit()
                print("✅ play_time_seconds column added")
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE mantras ADD COLUMN translations JSONB;"))
                conn.commit()
                print("✅ translations column added to mantras")
            except Exception:
                pass
    except Exception as e:
        print(f"⚠️ Startup Migration Error: {e}")

    # --- Redis Cache ---
    from app.core.redis_cache import cache
    await cache.connect()

    # --- Automation Scheduler ---
    print("🚀 Automation Scheduler (APScheduler) Started")
    scheduler.add_job(check_automation_tasks, 'cron', minute='*')
    scheduler.start()

@app.on_event("shutdown")
async def shutdown_event():
    # --- Redis Cache ---
    from app.core.redis_cache import cache
    await cache.disconnect()

    # --- Scheduler ---
    if scheduler.running:
        scheduler.shutdown(wait=False)
    print("🛑 Application shutdown complete")

# Configure CORS
if settings.ALLOWED_ORIGINS:
    origins = settings.ALLOWED_ORIGINS
else:
    origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "https://arunachala-web.vercel.app"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure CORS headers on all exceptions
from fastapi import Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
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
    
    # Manually add CORS headers
    origin = request.headers.get("origin")
    allowed = settings.ALLOWED_ORIGINS if isinstance(settings.ALLOWED_ORIGINS, list) else []
    
    if origin and (origin in allowed or ".vercel.app" in origin or "localhost" in origin):
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
    
    return response

from fastapi import HTTPException
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    response = JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )
    
    # Manually add CORS headers
    origin = request.headers.get("origin")
    allowed = settings.ALLOWED_ORIGINS if isinstance(settings.ALLOWED_ORIGINS, list) else []
    if origin and (origin in allowed or ".vercel.app" in origin or "localhost" in origin):
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    
    return response


# Include Routers
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
app.include_router(legacy.router) # handle /api/article alias
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(rag.router)  # RAG sync endpoints
app.include_router(automation.router) # Automation tasks
app.include_router(suggestions.router) # User suggestions
app.include_router(site_config.router)
app.include_router(subscriptions.router, prefix="/api/subscriptions")
app.include_router(subscriptions.router, prefix="/api/subscription") # Alias for compatibility
app.include_router(promotions.router, prefix="/api/promotions")
app.include_router(promotions.router, prefix="/api/promotion") # Alias singular for n8n
app.include_router(announcements.router, prefix="/api/announcements")
app.include_router(announcements.router, prefix="/api/announcement") # Alias singular for n8n

app.include_router(tags.router, prefix="/api/tags", tags=["tags"])
app.include_router(seo.router)
app.include_router(mantras.router, prefix="/api/mantras", tags=["mantras"])
app.include_router(debug.router, prefix="/api/debug", tags=["debug"])
# Mount Static Files (for uploaded images)
import os
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
def read_root():
    return {"message": "Welcome to Arunachala API"}

@app.get("/sitemap.xml")
async def sitemap(db: Session = Depends(get_db)):
    """Generates a dynamic sitemap.xml including static pages, blog posts and meditations."""
    
    # Base configuration
    BASE_URL = "https://www.yogayterapiasarunachala.es"
    today = datetime.now().strftime('%Y-%m-%d')
    
    # 1. Define Static Pages
    static_pages = [
        ("/",                           "1.0", "daily"),
        ("/clases-de-yoga/",            "0.9", "weekly"),
        ("/terapias-y-masajes/",        "0.9", "weekly"),
        ("/terapias/masajes/",          "0.8", "monthly"),
        ("/terapias/terapias-holisticas/", "0.8", "monthly"),
        ("/actividades/",               "0.9", "daily"),
        ("/blog/",                      "0.9", "daily"),
        ("/nuestro-espacio/",           "0.7", "monthly"),
        ("/meditaciones/",              "0.8", "weekly"),
        ("/promociones/",               "0.8", "weekly"),
        ("/quienes-somos/",             "0.7", "monthly"),
        ("/contacto/",                  "0.6", "monthly"),
        ("/galeria/clases-de-yoga/",    "0.5", "monthly"),
        ("/galeria/terapias-y-masajes/", "0.5", "monthly"),
        ("/aviso-legal/",               "0.1", "yearly"),
        ("/politica-de-privacidad/",    "0.1", "yearly"),
    ]
    
    urls = []
    
    # Add static pages to list
    for path, priority, changefreq in static_pages:
        urls.append(f"""  <url>
    <loc>{BASE_URL}{path}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>{changefreq}</changefreq>
    <priority>{priority}</priority>
  </url>""")
    
    # 2. Get Dynamic Content (Blog & Meditations)
    dynamic_contents = db.query(Content).filter(
        Content.status == "published",
        Content.type.in_(["article", "meditation"]),
        ~Content.slug.contains("sugerencia")
    ).all()
    
    for item in dynamic_contents:
        # Avoid null updated_at
        lastmod = (item.updated_at or item.created_at or datetime.now()).strftime('%Y-%m-%d')
        path_prefix = "/blog" if item.type == "article" else "/meditaciones"
        
        urls.append(f"""  <url>
    <loc>{BASE_URL}{path_prefix}/{item.slug}/</loc>
    <lastmod>{lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>""")
        
    # 3. Get Activities
    activities = db.query(Activity).filter(
        Activity.is_active == True,
        ~Activity.slug.contains("sugerencia")
    ).all()
    for act in activities:
        lastmod = (act.updated_at or act.created_at or datetime.now()).strftime('%Y-%m-%d')
        urls.append(f"""  <url>
    <loc>{BASE_URL}/actividades/?slug={act.slug}</loc>
    <lastmod>{lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>""")

    # Construct final XML
    xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>"""

    return Response(content=xml_content, media_type="application/xml")
