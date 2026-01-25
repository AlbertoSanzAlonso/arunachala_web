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
