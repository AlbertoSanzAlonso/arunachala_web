import os
from PIL import Image
from fastapi import UploadFile, HTTPException
import uuid
import shutil

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static", "uploads")

def save_upload_file(upload_file: UploadFile, destination_dir: str = UPLOAD_DIR) -> str:
    try:
        # Create directory if it doesn't exist
        os.makedirs(destination_dir, exist_ok=True)

        # Generate unique filename
        filename = f"{uuid.uuid4()}.webp"
        file_location = os.path.join(destination_dir, filename)

        # Open image using Pillow
        image = Image.open(upload_file.file)

        # Convert to RGB if necessary (e.g. for PNGs with transparency if saving as JPEG, but WebP supports transparency)
        # However, it's good practice to ensure consistency. 
        # WebP handles RGBA, so we usually don't need to convert unless it's a specific mode not supported.

        # Save as WebP
        image.save(file_location, "WEBP", quality=80, optimize=True)
        
        return f"/static/uploads/{filename}"

    except Exception as e:
        print(f"Error saving image: {e}")
        # Cleanup if partial file exists
        if 'file_location' in locals() and os.path.exists(file_location):
            os.remove(file_location)
        raise HTTPException(status_code=500, detail=f"Could not save image: {str(e)}")
