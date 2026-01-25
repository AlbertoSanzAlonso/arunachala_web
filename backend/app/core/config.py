from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: Optional[str] = "postgresql://arunachala:arunachala1234@localhost:5432/arunachala_db"
    
    # Security
    SECRET_KEY: str = "supersecretkey" # Change this in production!
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"]
    
    # Storage Configuration (local vs cloudinary)
    STORAGE_TYPE: str = "local" # Options: "local", "cloudinary"
    
    # Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
