from pydantic_settings import BaseSettings
from typing import Optional, Union
from pydantic import field_validator

class Settings(BaseSettings):
    # Database
    DATABASE_URL: Optional[str] = "postgresql://arunachala:arunachala1234@localhost:5432/arunachala_db"
    
    # Security
    SECRET_KEY: str = "supersecretkey" # Change this in production!
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS - can be a list or comma-separated string
    ALLOWED_ORIGINS: Union[list[str], str] = "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000"
    
    @field_validator('ALLOWED_ORIGINS', mode='before')
    @classmethod
    def parse_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    # Storage Configuration (local vs cloudinary)
    STORAGE_TYPE: str = "local" # Options: "local", "cloudinary"
    
    # Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None

    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Email (SMTP)
    MAIL_SERVER: Optional[str] = None
    MAIL_PORT: int = 587
    MAIL_USERNAME: Optional[str] = None
    MAIL_PASSWORD: Optional[str] = None
    MAIL_FROM: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore" # Important: don't crash if .env has extra vars

settings = Settings()
