from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    # Fix for newer sqlalchemy
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://")

engine = create_engine(DATABASE_URL)

def migrate():
    columns_to_add = [
        ("view_count", "INTEGER DEFAULT 0"),
        ("play_time_seconds", "INTEGER DEFAULT 0"),
        ("vector_id", "VARCHAR"),
        ("vectorized_at", "TIMESTAMP WITH TIME ZONE"),
        ("needs_reindex", "BOOLEAN DEFAULT TRUE"),
    ]
    
    with engine.connect() as conn:
        print("Checking contents table columns...")
        for col_name, col_type in columns_to_add:
            try:
                # Check if column exists
                res = conn.execute(text(f"SELECT column_name FROM information_schema.columns WHERE table_name='contents' AND column_name='{col_name}';"))
                if not res.fetchone():
                    print(f"Adding column {col_name}...")
                    conn.execute(text(f"ALTER TABLE contents ADD COLUMN {col_name} {col_type};"))
                    conn.commit()
                else:
                    print(f"Column {col_name} already exists.")
            except Exception as e:
                print(f"Error adding {col_name}: {e}")
        
        print("Schema sync complete.")

if __name__ == "__main__":
    migrate()
