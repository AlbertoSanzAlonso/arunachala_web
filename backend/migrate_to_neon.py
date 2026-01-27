import os
import sys
from sqlalchemy import create_engine, MetaData, Table
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Add parent dir to path to import models if needed, though we can reflect tables
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configuration
SOURCE_DB_URL = "postgresql://arunachala:arunachala1234@localhost:5432/arunachala_db"
# DEST_DB_URL comes from env or we paste it here temporarily if env is loaded logic is complex
# Reading from .env file line directly to avoid loading the app config which might confuse things
def get_dest_url():
    with open(".env", "r") as f:
        for line in f:
            if line.startswith("DATABASE_URL="):
                return line.strip().split("=", 1)[1]
    return None

DEST_DB_URL = get_dest_url()

def migrate_data():
    print("--- Starting Migration ---")
    print(f"Source: {SOURCE_DB_URL}")
    print(f"Dest:   {DEST_DB_URL}")

    if not DEST_DB_URL or "neon.tech" not in DEST_DB_URL:
        print("Error: Destination URL in .env does not look like Neon. Aborting safety check.")
        return

    # Engines
    source_engine = create_engine(SOURCE_DB_URL)
    dest_engine = create_engine(DEST_DB_URL)

    metadata = MetaData()

    # Tables to migrate in order (to respect foreign keys if any)
    # Users first, then content using users
    tables = [
        "users",
        "massage_types",
        "therapy_types",
        "schedules",
        "gallery_images",
        "reviews", # If exists
        "blog_posts" # If exists
    ]

    with source_engine.connect() as source_conn, dest_engine.connect() as dest_conn:
        # Reflection to get table schema from source
        metadata.reflect(bind=source_engine)

        for table_name in tables:
            if table_name not in metadata.tables:
                print(f"Skipping {table_name} (not found in source)")
                continue

            print(f"Migrating table: {table_name}...")
            table = metadata.tables[table_name]
            
            # Select all string data
            # Using simple select
            stmt = table.select()
            data = source_conn.execute(stmt).fetchall()
            
            if not data:
                print(f" - No entries found.")
                continue

            print(f" - Found {len(data)} entries.")

            # Insert into destination
            # We use SQLAlchemy core to avoid model definition mismatches
            # Check if table exists in dest (it should if create_all ran)
            # We assume schema is identical.
            
            # Prepare list of dicts
            data_dicts = [dict(row._mapping) for row in data]
            
            # Insert
            # Handle conflicts? Basic insert. If ID exists, it will fail.
            # Ideally we might want to TRUNCATE dest table first or use ON CONFLICT DO NOTHING
            # For migration, clearing dest first is cleaner if we want a mirror.
            
            try:
                # Optional: Clear table first? 
                # dest_conn.execute(table.delete()) 
                # print(f" - Cleared destination table.")
                
                # Insert
                dest_conn.execute(table.insert(), data_dicts)
                # Commit
                dest_conn.commit()
                print(f" - Successfully migrated {len(data)} rows.")
            except Exception as e:
                print(f" - Error migrating {table_name}: {e}")
                dest_conn.rollback()

    print("--- Migration Completed ---")

if __name__ == "__main__":
    confirm = input("This will copy data from Local DB to Neon DB (defined in .env). Continue? (y/n): ")
    if confirm.lower() == 'y':
        migrate_data()
    else:
        print("Cancelled.")
