from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.core.database import engine, Base
from app.models import models
import os

# Import the reviews router
# Import routers
from app.api import reviews, auth, gallery, schedules, yoga_classes
from fastapi.staticfiles import StaticFiles

load_dotenv()

# Create Tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Arunachala API")

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://127.0.0.1:3000",
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


# Mount Static Files (for uploaded images)
# Calculate absolute path to avoid CWD issues - point to /backend/static/
import os
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
def read_root():
    return {"message": "Welcome to Arunachala API"}
