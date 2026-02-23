from pydantic_settings import BaseSettings
from typing import Optional, Union
from pydantic import field_validator
import json

class Settings(BaseSettings):
    # Database
    DATABASE_URL: Optional[str] = "postgresql://arunachala:arunachala1234@localhost:5432/arunachala_db"
    
    # Security
    SECRET_KEY: str = "supersecretkey" # Change this in production!
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # AI API Keys
    OPENAI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    
    # CORS - can be a list or comma-separated string
    ALLOWED_ORIGINS: Union[list[str], str] = "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000"
    
    @field_validator('ALLOWED_ORIGINS', mode='before')
    @classmethod
    def parse_origins(cls, v):
        if isinstance(v, str):
            v_stripped = v.strip()
            # If it looks like a JSON list, try to parse it
            if v_stripped.startswith("[") and v_stripped.endswith("]"):
                try:
                    return json.loads(v_stripped)
                except:
                    # Fallback to simple split if json loading fails
                    v_stripped = v_stripped[1:-1] # remove brackets
            
            # Simple comma separated strings
            return [origin.strip().strip('"').strip("'") for origin in v_stripped.split(',')]
        return v
    
    # Storage Configuration (local vs cloudinary)

    


    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Redis Cache
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_TTL_INVENTORY: int = 300   # 5 min
    CACHE_TTL_CONFIG: int = 600      # 10 min
    CACHE_TTL_CONTENT: int = 120     # 2 min
    
    # Email (SMTP)
    MAIL_SERVER: Optional[str] = None
    MAIL_PORT: int = 587
    MAIL_USERNAME: Optional[str] = None
    MAIL_PASSWORD: Optional[str] = None
    MAIL_FROM: Optional[str] = None

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore"
    }

settings = Settings()
