from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.models import models
import os

from app.api import reviews, auth, gallery, schedules, yoga_classes, treatments, content, activities, upload, dashboard, rag
from app.routers import chat
from fastapi.staticfiles import StaticFiles

# Create Tables
models.Base.metadata.create_all(bind=engine)

from app.core.config import settings

app = FastAPI(title="Arunachala API")

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "https://arunachala-web.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(rag.router)  # RAG sync endpoints


# Mount Static Files (for uploaded images)
import os
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
def read_root():
    return {"message": "Welcome to Arunachala API"}
