from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Import the reviews router
# Adjust the import based on your actual file structure
# If 'app' is a package (has __init__.py), use: from app.api import reviews
# If running from backend root: from app.api import reviews
from app.api import reviews

load_dotenv()

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

@app.get("/")
def read_root():
    return {"message": "Welcome to Arunachala API"}
