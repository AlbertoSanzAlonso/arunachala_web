from sqlalchemy import create_engine, text
import os

# Hardcode URL to avoid dotenv dependency issues in this quick script
DATABASE_URL = "postgresql://arunachala:arunachala1234@localhost:5432/arunachala_db"

print(f"Connecting to {DATABASE_URL}...")
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("Adding 'slug' column to 'promotions' table...")
    try:
        conn.execute(text("ALTER TABLE promotions ADD COLUMN IF NOT EXISTS slug VARCHAR;"))
        conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_promotions_slug ON promotions (slug);"))
        conn.commit()
        print("✅ Column 'slug' added successfully.")
    except Exception as e:
        print(f"❌ Error adding columns: {e}")
        conn.rollback()

print("Migration complete.")
