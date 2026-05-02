import os
import shutil
import uuid
import io
from PIL import Image
from fastapi import UploadFile, HTTPException

# Point to /backend/static/ instead of /backend/app/static/
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "static")

# Hybrid Storage Configuration
STORAGE_TYPE = os.getenv("STORAGE_TYPE", "local")

if STORAGE_TYPE == "supabase":
    from supabase import create_client, Client
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Warning: STORAGE_TYPE is 'supabase' but SUPABASE_URL or SUPABASE_KEY is missing.")
        supabase_client = None
    else:
        supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    supabase_client = None

import re
from unidecode import unidecode

def slugify(text: str) -> str:
    """Helper to convert text to SEO friendly slug"""
    text = unidecode(text).lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')

def save_upload_file(upload_file: UploadFile, subdirectory: str = "uploads", title: str = None) -> str:
    """
    Saves an uploaded file to local storage or Supabase based on configuration.
    Returns the URL/path to the saved file.
    """
    try:
        # Generate SEO friendly filename from original name or title
        original_ext = os.path.splitext(upload_file.filename)[1] if upload_file.filename else ".bin"
        original_base_name = os.path.splitext(upload_file.filename)[0] if upload_file.filename else "file"
        base_name_str = title if title else original_base_name
        base_name = slugify(base_name_str)
        if not base_name:
            base_name = "file"
            
        # Determine if it's an image we should convert to webp
        is_image = upload_file.content_type and upload_file.content_type.startswith("image/")
        
        if is_image:
            filename = f"{base_name}-{uuid.uuid4().hex[:8]}.webp"
            # Open image using Pillow
            upload_file.file.seek(0)
            image = Image.open(upload_file.file)
        else:
            # For audio/other, keep original extension or use binary
            filename = f"{base_name}-{uuid.uuid4().hex[:8]}{original_ext}"
            upload_file.file.seek(0)
            file_content = upload_file.file.read()

        if STORAGE_TYPE == "supabase" and supabase_client:
            bucket_name = "arunachala-images"
            file_path = f"{subdirectory}/{filename}"
            
            if is_image:
                # Save to memory buffer as WebP
                buffer = io.BytesIO()
                image.save(buffer, format="WEBP", quality=80, optimize=True)
                content_to_upload = buffer.getvalue()
                mimetype = "image/webp"
            else:
                content_to_upload = file_content
                mimetype = upload_file.content_type or "application/octet-stream"
            
            # Upload to Supabase Storage
            res = supabase_client.storage.from_(bucket_name).upload(
                file=content_to_upload,
                path=file_path,
                file_options={"content-type": mimetype}
            )
            
            # Get public url
            public_url = supabase_client.storage.from_(bucket_name).get_public_url(file_path)
            if public_url.endswith('?'):
                public_url = public_url[:-1]
            return public_url
            
        else:
            # LOCAL STORAGE
            destination_dir = os.path.join(STATIC_DIR, subdirectory)
            os.makedirs(destination_dir, exist_ok=True)
            
            file_location = os.path.join(destination_dir, filename)

            if is_image:
                # Save as WebP
                image.save(file_location, "WEBP", quality=80, optimize=True)
            else:
                # Save original content
                with open(file_location, "wb") as f:
                    f.write(file_content)
            
            return f"/static/{subdirectory}/{filename}"

    except Exception as e:
        print(f"Error saving image from file: {e}")
        # Cleanup if partial file exists
        if STORAGE_TYPE != "supabase":
            if 'file_location' in locals() and os.path.exists(file_location):
                try:
                    os.remove(file_location)
                except:
                    pass
        raise HTTPException(status_code=500, detail=f"Could not save image: {str(e)}")

def save_image_from_bytes(content: bytes, subdirectory: str = "gallery/articles", filename: str = None) -> str:
    """
    Saves an image from raw bytes to local storage or Supabase based on configuration.
    Returns the URL/path to the saved file.
    """
    try:
        # Generate unique filename if not provided
        if not filename:
            filename = f"gen_{uuid.uuid4().hex[:8]}.webp"
        elif not filename.endswith(".webp") and not "." in filename:
             filename = f"{filename}.webp"
        elif not filename.endswith(".webp"):
            filename = os.path.splitext(filename)[0] + ".webp"
        
        # Open image using Pillow to optimize/convert
        image = Image.open(io.BytesIO(content))
        
        # Convert to RGBA/RGB as needed
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGBA")
        else:
            image = image.convert("RGB")

        if STORAGE_TYPE == "supabase" and supabase_client:
            # Save to memory buffer as WebP
            buffer = io.BytesIO()
            image.save(buffer, format="WEBP", quality=80, optimize=True)
            buffer.seek(0)
            
            # Use 'arunachala-images' bucket
            bucket_name = "arunachala-images"
            file_path = f"{subdirectory}/{filename}"
            
            # Upload to Supabase Storage
            # Upload to Supabase Storage
            try:
                print(f"📡 Supabase: Uploading to {bucket_name}/{file_path}")
                supabase_client.storage.from_(bucket_name).upload(
                    file=buffer.getvalue(),
                    path=file_path,
                    file_options={"content-type": "image/webp"}
                )
                
                # Get public url
                public_url = supabase_client.storage.from_(bucket_name).get_public_url(file_path)
                if public_url.endswith('?'):
                    public_url = public_url[:-1]
                print(f"✅ Supabase: Uploaded successfully -> {public_url}")
                return public_url
            except Exception as upload_err:
                print(f"❌ Supabase: Upload failed: {upload_err}")
                # Don't return None here yet, might fall back to local if directory exists and is writable
                # but in production we want to know why this failed.
                raise upload_err
            
        else:
            # LOCAL STORAGE
            destination_dir = os.path.join(STATIC_DIR, subdirectory)
            os.makedirs(destination_dir, exist_ok=True)
            
            file_location = os.path.join(destination_dir, filename)
            image.save(file_location, "WEBP", quality=80, optimize=True)
            
            return f"/static/{subdirectory}/{filename}"

    except Exception as e:
        print(f"Error saving image from bytes: {e}")
        raise HTTPException(status_code=500, detail=f"Could not save image from bytes: {str(e)}")

import logging
logger = logging.getLogger("uvicorn.error")

def delete_file(file_url: str) -> bool:
    """
    Deletes a file given its URL, locally or on Supabase.
    Returns True if deleted, False otherwise.
    """
    if not file_url:
        return False
        
    logger.info(f"🗑️ Attempting to delete file: {file_url}")
    deleted_local = False
    deleted_supabase = False
    
    try:
        # 1. Try Supabase deletion if configured
        if supabase_client:
            from urllib.parse import unquote
            bucket_name = "arunachala-images"
            file_path = None
            
            # Case A: Full Supabase URL
            if bucket_name in file_url:
                parts = file_url.split(f"/{bucket_name}/")
                if len(parts) > 1:
                    file_path = parts[1].split("?")[0]
            
            # Case B: Local /static/ path that might be mirrored/redirected to Supabase
            elif file_url.startswith("/static/"):
                file_path = file_url[len("/static/"):]
            
            if file_path:
                file_path = unquote(file_path)
                try:
                    logger.info(f"📡 Supabase Storage: calling remove for path: {file_path}")
                    # We don't check the response here because if it's already gone it might fail
                    # but we want to ensure we tried.
                    supabase_client.storage.from_(bucket_name).remove([file_path])
                    logger.info(f"✅ Supabase Storage: delete command sent for {file_path}")
                    deleted_supabase = True
                except Exception as e:
                    logger.warning(f"❌ Supabase Storage: error during remove: {e}")
        
        # 2. Try Local deletion if it's a static path
        if file_url.startswith("/static/"):
            relative_path = file_url[len("/static/"):]
            full_path = os.path.join(STATIC_DIR, relative_path)
            
            if os.path.exists(full_path) and os.path.isfile(full_path):
                try:
                    os.remove(full_path)
                    logger.info(f"✅ Local File: deleted {full_path}")
                    deleted_local = True
                except Exception as e:
                    logger.error(f"❌ Local File: error removing {full_path}: {e}")
            else:
                logger.info(f"ℹ️  Local File: not found on disk at {full_path}")
        
        return deleted_local or deleted_supabase

    except Exception as e:
        logger.error(f"🚨 Unexpected error in delete_file for {file_url}: {e}")
        return False
