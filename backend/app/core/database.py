from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Default to empty string to fail loud if not set, or better, fail if not set.
# But for now, let's just make sure we prioritize the ENV and fail if it tries to fallback to sqlite.
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Fallback for local development if .env is not loaded correctly by uvicorn
    # This matches the docker-compose setup
    DATABASE_URL = "postgresql://arunachala:arunachala1234@localhost:5432/arunachala_db"

if "sqlite" in DATABASE_URL:
    raise ValueError("SQLite is forbidden! Configure DATABASE_URL to use PostgreSQL.")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
