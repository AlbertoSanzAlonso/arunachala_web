import os
import shutil
import uuid
from PIL import Image
from fastapi import UploadFile, HTTPException

# Point to /backend/static/ instead of /backend/app/static/
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "static")

def save_upload_file(upload_file: UploadFile, subdirectory: str = "uploads") -> str:
    """
    Saves an uploaded file to local storage.
    Returns the URL/path to the saved file.
    """
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
            try:
                os.remove(file_location)
            except:
                pass
        raise HTTPException(status_code=500, detail=f"Could not save image: {str(e)}")

def delete_file(file_url: str) -> bool:
    """
    Deletes a file given its local path URL.
    Returns True if deleted, False otherwise.
    """
    if not file_url:
        return False
        
    try:
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
