from dotenv import load_dotenv
import os

# Explicitly load .env from current directory
load_dotenv()

print(f"DATABASE_URL from env: {os.getenv('DATABASE_URL')}")

from app.core.database import engine, Base
from app.models.models import AgentConfig
from sqlalchemy import text

def fix_table():
    print(f"Engine URL: {engine.url}")
    with engine.connect() as conn:
        print("Dropping table on remote...")
        conn.execute(text("DROP TABLE IF EXISTS agent_config"))
        conn.commit()
    
    print("Creating table on remote...")
    Base.metadata.create_all(bind=engine)
    print("Table agent_config recreated successfully.")

if __name__ == "__main__":
    fix_table()
