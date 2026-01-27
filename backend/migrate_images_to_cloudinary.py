import os
import sys
import cloudinary
import cloudinary.uploader
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load env to get credentials
load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

# Database Configuration (Neon)
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    print("Error: DATABASE_URL not found in .env")
    sys.exit(1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_local_path(relative_path):
    # Remove leading slash if present
    if relative_path.startswith('/'):
        relative_path = relative_path[1:]
    
    # Assuming script is in backend/ directory
    base_dir = os.path.dirname(os.path.abspath(__file__)) # backend/
    full_path = os.path.join(base_dir, relative_path)
    return full_path

def migrate_table_images(table_name, id_column='id', url_column='image_url', subdirectory='misc'):
    print(f"\nScanning table '{table_name}' for local images...")
    db = SessionLocal()
    
    try:
        # Use text SQL for flexibility across different models
        sql = text(f"SELECT {id_column}, {url_column} FROM {table_name} WHERE {url_column} LIKE '/static/%'")
        rows = db.execute(sql).fetchall()
        
        print(f"Found {len(rows)} rows with local images.")
        
        for row in rows:
            record_id = row[0]
            current_url = row[1]
            local_file_path = get_local_path(current_url)
            
            print(f"Processing ID {record_id}: {current_url}")
            
            if os.path.exists(local_file_path):
                print(f"  - Uploading to Cloudinary...")
                try:
                    # Upload
                    # Use unique public_id relative to content
                    folder = f"arunachala/{subdirectory}"
                    filename = os.path.basename(local_file_path).split('.')[0]
                    
                    response = cloudinary.uploader.upload(
                        local_file_path, 
                        folder=folder,
                        public_id=f"{filename}_{record_id}",
                        resource_type="image"
                    )
                    
                    new_url = response['secure_url']
                    print(f"  - Uploaded! New URL: {new_url}")
                    
                    # Update DB
                    update_sql = text(f"UPDATE {table_name} SET {url_column} = :url WHERE {id_column} = :id")
                    db.execute(update_sql, {"url": new_url, "id": record_id})
                    db.commit()
                    
                except Exception as e:
                    print(f"  - Error uploading: {e}")
            else:
                print(f"  - File not found locally: {local_file_path}")
                
    except Exception as e:
        print(f"Error querying table {table_name}: {e}")
    finally:
        db.close()

def main():
    print("--- Starting Image Migration to Cloudinary ---")
    
    # 1. Massages
    migrate_table_images('massage_types', subdirectory='treatments/massages')
    
    # 2. Therapies
    migrate_table_images('therapy_types', subdirectory='treatments/therapies')
    
    # 3. Users (Profile Pictures)
    migrate_table_images('users', url_column='profile_picture', subdirectory='profiles')
    
    # 4. Gallery (if exists)
    # Checking if table exists handled inside try/catch loosely or we assume it exists from migration
    migrate_table_images('gallery_images', url_column='url', subdirectory='gallery')
    
    print("\n--- Migration Finished ---")

if __name__ == "__main__":
    confirm = input("This will upload local images to Cloudinary and update the Remote DB. Continue? (y/n): ")
    if confirm.lower() == 'y':
        main()
    else:
        print("Cancelled.")
