from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ No DATABASE_URL found in .env")
    exit(1)

print(f"Connecting to {DATABASE_URL}...")
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("Adding columns to 'promotions' table...")
    try:
        conn.execute(text("ALTER TABLE promotions ADD COLUMN IF NOT EXISTS vector_id VARCHAR;"))
        conn.execute(text("ALTER TABLE promotions ADD COLUMN IF NOT EXISTS vectorized_at TIMESTAMP WITH TIME ZONE;"))
        conn.execute(text("ALTER TABLE promotions ADD COLUMN IF NOT EXISTS needs_reindex BOOLEAN DEFAULT TRUE;"))
        conn.commit()
        print("✅ Columns added successfully.")
    except Exception as e:
        print(f"❌ Error adding columns: {e}")
        conn.rollback()

print("Migration complete.")
