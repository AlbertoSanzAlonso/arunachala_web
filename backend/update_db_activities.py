
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

# Load env vars from backend/.env
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Construct database URL
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL not found in environment variables.")
    exit(1)

print(f"Connecting to: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'LOCAL'}")

def add_activity_data_column():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        conn.execution_options(isolation_level="AUTOCOMMIT")
        try:
            # Check if column exists
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='activities' AND column_name='activity_data'"))
            if result.fetchone():
                print("Column 'activity_data' already exists.")
            else:
                print("Adding 'activity_data' column to 'activities' table...")
                conn.execute(text("ALTER TABLE activities ADD COLUMN activity_data JSONB DEFAULT '{}'::jsonb"))
                print("Column added successfully.")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    add_activity_data_column()
