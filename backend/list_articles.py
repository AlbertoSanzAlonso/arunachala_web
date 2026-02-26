from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://")

# Try to force IPv4 by replacing the hostname with its IP if we can resolve it, 
# but let's just try standard first.
engine = create_engine(DATABASE_URL)

def list_recent():
    with engine.connect() as conn:
        try:
            print("--- RECENT ARTICLES ---")
            res = conn.execute(text("SELECT id, title, status, created_at, category FROM contents WHERE type='article' ORDER BY created_at DESC LIMIT 10;"))
            for row in res:
                print(f"ID: {row[0]} | Title: {row[1]} | Status: {row[2]} | Date: {row[3]} | Cat: {row[4]}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    list_recent()
