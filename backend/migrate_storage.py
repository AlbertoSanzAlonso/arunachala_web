import os
import sqlalchemy as sa
from sqlalchemy.orm import Session
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Cloud DB URL
CLOUD_URL = "postgresql://neondb_owner:npg_fL4z6dKanCXW@ep-lingering-cell-ahlfz6wn-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Cloudinary Config
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

engine = sa.create_engine(CLOUD_URL)

# Mapping of tables and columns that store image paths
MIGRATION_MAP = {
    "contents": ["thumbnail_url", "media_url"],
    "activities": ["image_url"],
    "massage_types": ["image_url"],
    "therapy_types": ["image_url"],
    "yoga_classes": [], # No images here
    "gallery": ["url"]
}

BASE_STATIC_PATH = os.path.dirname(os.path.abspath(__file__))

def migrate_storage():
    print("--- ☁️ Starting Image Migration to Cloudinary ---")
    
    with engine.connect() as conn:
        for table, columns in MIGRATION_MAP.items():
            if not columns:
                continue
                
            print(f"Checking table: {table}")
            for col in columns:
                # Select rows where column is not null and starts with /static/
                query = sa.text(f"SELECT id, {col} FROM {table} WHERE {col} LIKE '/static/%'")
                result = conn.execute(query)
                rows = result.fetchall()
                
                if not rows:
                    print(f"  No local images found in {table}.{col}")
                    continue
                    
                print(f"  Found {len(rows)} images to migrate in {table}.{col}")
                
                for row_id, local_path in rows:
                    full_local_path = os.path.join(BASE_STATIC_PATH, local_path.lstrip('/'))
                    
                    if not os.path.exists(full_local_path):
                        print(f"    ⚠️ File not found: {full_local_path}")
                        continue
                    
                    try:
                        # Determine folder name based on table/path
                        folder = "general"
                        if "articles" in local_path: folder = "articles"
                        elif "meditations" in local_path: folder = "meditations"
                        elif "therapy" in local_path: folder = "therapy"
                        elif "yoga" in local_path: folder = "yoga"
                        elif "gallery" in local_path: folder = "gallery"
                        
                        print(f"    Uploading {local_path}...")
                        upload_result = cloudinary.uploader.upload(
                            full_local_path,
                            folder=f"arunachala/{folder}",
                            use_filename=True,
                            unique_filename=True
                        )
                        
                        cloudinary_url = upload_result.get("secure_url")
                        
                        # Update DB
                        update_query = sa.text(f"UPDATE {table} SET {col} = :new_url WHERE id = :id")
                        conn.execute(update_query, {"new_url": cloudinary_url, "id": row_id})
                        conn.commit()
                        print(f"    ✅ Migrated to: {cloudinary_url}")
                        
                    except Exception as e:
                        print(f"    ❌ Error uploading {local_path}: {e}")

if __name__ == "__main__":
    migrate_storage()
