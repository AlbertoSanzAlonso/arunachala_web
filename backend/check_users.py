from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.models import User
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Fallback to local default if env not loaded correctly in script
    DATABASE_URL = "postgresql://arunachala:arunachala1234@localhost:5432/arunachala_db"

try:
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    users = db.query(User).all()
    print("--- USERS IN DB ---")
    for user in users:
        print(f"ID: {user.id} | Email: {user.email} | Role: {user.role}")
    print("-------------------")
    
except Exception as e:
    print(f"Error querying DB: {e}")
