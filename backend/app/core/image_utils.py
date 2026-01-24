import os
from PIL import Image
from fastapi import UploadFile, HTTPException
import uuid
import shutil

# Point to /backend/static/ instead of /backend/app/static/
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "static")

def save_upload_file(upload_file: UploadFile, subdirectory: str = "uploads") -> str:
    try:
        # Create full destination directory
        destination_dir = os.path.join(STATIC_DIR, subdirectory)
        os.makedirs(destination_dir, exist_ok=True)

        # Generate unique filename
        filename = f"{uuid.uuid4()}.webp"
        file_location = os.path.join(destination_dir, filename)

        # Open image using Pillow
        image = Image.open(upload_file.file)

        # Save as WebP
        image.save(file_location, "WEBP", quality=80, optimize=True)
        
        return f"/static/{subdirectory}/{filename}"

    except Exception as e:
        print(f"Error saving image: {e}")
        # Cleanup if partial file exists
        if 'file_location' in locals() and os.path.exists(file_location):
            os.remove(file_location)
        raise HTTPException(status_code=500, detail=f"Could not save image: {str(e)}")
