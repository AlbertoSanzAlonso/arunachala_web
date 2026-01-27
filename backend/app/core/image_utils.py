import os
import shutil
import uuid
from PIL import Image
from fastapi import UploadFile, HTTPException
from app.core.config import settings

# Point to /backend/static/ instead of /backend/app/static/
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "static")

# Initialize Cloudinary if configured
if settings.STORAGE_TYPE == "cloudinary":
    import cloudinary
    import cloudinary.uploader
    
    if all([settings.CLOUDINARY_CLOUD_NAME, settings.CLOUDINARY_API_KEY, settings.CLOUDINARY_API_SECRET]):
        cloudinary.config( 
            cloud_name = settings.CLOUDINARY_CLOUD_NAME, 
            api_key = settings.CLOUDINARY_API_KEY, 
            api_secret = settings.CLOUDINARY_API_SECRET 
        )

def save_upload_file(upload_file: UploadFile, subdirectory: str = "uploads") -> str:
    """
    Saves an uploaded file to either local storage or Cloudinary, depending on settings.
    Returns the URL/path to the saved file.
    """
    
    # 1. CLOUDINARY STORAGE STRATEGY
    if settings.STORAGE_TYPE == "cloudinary":
        try:
            # Puntero al inicio del archivo
            upload_file.file.seek(0)
            
            # Upload to Cloudinary
            # We use 'folder' parameter to organize images similarly to local subdirectories
            result = cloudinary.uploader.upload(
                upload_file.file,
                folder=f"arunachala/{subdirectory}",
                resource_type="image",
                format="webp", # Convert to WebP automatically
                quality="auto", # Optimize quality
                fetch_format="auto" # Optimize format
            )
            
            return result.get("secure_url")
            
        except Exception as e:
            print(f"Error uploading to Cloudinary: {e}")
            raise HTTPException(status_code=500, detail=f"Cloudinary upload failed: {str(e)}")

    # 2. LOCAL FILE SYSTEM STRATEGY (Default)
    else:
        try:
            # Create full destination directory
            destination_dir = os.path.join(STATIC_DIR, subdirectory)
            os.makedirs(destination_dir, exist_ok=True)

            # Generate unique filename
            filename = f"{uuid.uuid4()}.webp"
            file_location = os.path.join(destination_dir, filename)

            # Open image using Pillow
            # Reset file pointer just in case
            upload_file.file.seek(0)
            image = Image.open(upload_file.file)

            # Save as WebP
            image.save(file_location, "WEBP", quality=80, optimize=True)
            
            return f"/static/{subdirectory}/{filename}"

        except Exception as e:
            print(f"Error saving image locally: {e}")
            # Cleanup if partial file exists
            if 'file_location' in locals() and os.path.exists(file_location):
                os.remove(file_location)
            raise HTTPException(status_code=500, detail=f"Could not save image: {str(e)}")

def delete_file(file_url: str) -> bool:
    """
    Deletes a file given its URL (local path or Cloudinary URL).
    Returns True if deleted, False otherwise.
    """
    if not file_url:
        return False
        
    try:
        # 1. Cloudinary deletion
        if "res.cloudinary.com" in file_url:
            import cloudinary.uploader
            # Extract public_id from URL
            # Cloudinary URLs look like: https://res.cloudinary.com/cloud/image/upload/v123/arunachala/yoga/id.webp
            # We need the path after 'upload/v[digits]/' and remove the extension
            import re
            match = re.search(r'upload/v\d+/(.+)\.\w+$', file_url)
            if match:
                public_id = match.group(1)
                cloudinary.uploader.destroy(public_id)
                print(f"Deleted from Cloudinary: {public_id}")
                return True

        # 2. Local file system deletion
        if file_url.startswith("/static/"):
            relative_path = file_url[len("/static/"):]
            full_path = os.path.join(STATIC_DIR, relative_path)
            
            if os.path.exists(full_path) and os.path.isfile(full_path):
                os.remove(full_path)
                print(f"Deleted locally: {full_path}")
                return True
        return False
    except Exception as e:
        print(f"Error deleting file {file_url}: {e}")
        return False
