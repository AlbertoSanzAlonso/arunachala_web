import os
import uuid
import io
import re
import logging
from PIL import Image
from fastapi import UploadFile, HTTPException
from unidecode import unidecode

# Point to /backend/static/ instead of /backend/app/static/
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "static")

STORAGE_TYPE = os.getenv("STORAGE_TYPE", "local").strip().lower()
if STORAGE_TYPE not in ("local", "s3"):
    STORAGE_TYPE = "local"

logger = logging.getLogger("uvicorn.error")


def slugify(text: str) -> str:
    """Helper to convert text to SEO friendly slug"""
    text = unidecode(text).lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')


def save_upload_file(upload_file: UploadFile, subdirectory: str = "uploads", title: str = None) -> str:
    """
    Saves an uploaded file to local disk or S3 (MinIO).
    Returns the URL/path to the saved file.
    """
    try:
        original_ext = os.path.splitext(upload_file.filename)[1] if upload_file.filename else ".bin"
        original_base_name = os.path.splitext(upload_file.filename)[0] if upload_file.filename else "file"
        base_name_str = title if title else original_base_name
        base_name = slugify(base_name_str)
        if not base_name:
            base_name = "file"

        is_image = upload_file.content_type and upload_file.content_type.startswith("image/")

        if is_image:
            filename = f"{base_name}-{uuid.uuid4().hex[:8]}.webp"
            upload_file.file.seek(0)
            image = Image.open(upload_file.file)
        else:
            filename = f"{base_name}-{uuid.uuid4().hex[:8]}{original_ext}"
            upload_file.file.seek(0)
            file_content = upload_file.file.read()

        if STORAGE_TYPE == "s3":
            from app.core.object_storage import put_bytes
            file_path = f"{subdirectory}/{filename}"
            if is_image:
                buffer = io.BytesIO()
                image.save(buffer, format="WEBP", quality=80, optimize=True)
                return put_bytes(file_path, buffer.getvalue(), content_type="image/webp")
            return put_bytes(
                file_path,
                file_content,
                content_type=upload_file.content_type or "application/octet-stream",
            )

        destination_dir = os.path.join(STATIC_DIR, subdirectory)
        os.makedirs(destination_dir, exist_ok=True)
        file_location = os.path.join(destination_dir, filename)

        if is_image:
            image.save(file_location, "WEBP", quality=80, optimize=True)
        else:
            with open(file_location, "wb") as f:
                f.write(file_content)

        return f"/static/{subdirectory}/{filename}"

    except Exception as e:
        print(f"Error saving image from file: {e}")
        if STORAGE_TYPE == "local":
            if 'file_location' in locals() and os.path.exists(file_location):
                try:
                    os.remove(file_location)
                except Exception:
                    pass
        raise HTTPException(status_code=500, detail=f"Could not save image: {str(e)}")


def save_image_from_bytes(content: bytes, subdirectory: str = "gallery/articles", filename: str = None) -> str:
    """
    Saves an image from raw bytes to local disk or S3 (MinIO).
    Returns the URL/path to the saved file.
    """
    try:
        if not filename:
            filename = f"gen_{uuid.uuid4().hex[:8]}.webp"
        elif not filename.endswith(".webp") and "." not in filename:
            filename = f"{filename}.webp"
        elif not filename.endswith(".webp"):
            filename = os.path.splitext(filename)[0] + ".webp"

        image = Image.open(io.BytesIO(content))

        if image.mode in ("RGBA", "P"):
            image = image.convert("RGBA")
        else:
            image = image.convert("RGB")

        if STORAGE_TYPE == "s3":
            from app.core.object_storage import put_bytes
            buffer = io.BytesIO()
            image.save(buffer, format="WEBP", quality=80, optimize=True)
            return put_bytes(f"{subdirectory}/{filename}", buffer.getvalue(), content_type="image/webp")

        destination_dir = os.path.join(STATIC_DIR, subdirectory)
        os.makedirs(destination_dir, exist_ok=True)
        file_location = os.path.join(destination_dir, filename)
        image.save(file_location, "WEBP", quality=80, optimize=True)
        return f"/static/{subdirectory}/{filename}"

    except Exception as e:
        print(f"Error saving image from bytes: {e}")
        raise HTTPException(status_code=500, detail=f"Could not save image from bytes: {str(e)}")


def delete_file(file_url: str) -> bool:
    """
    Deletes a file given its URL, locally or on S3/MinIO.
    Returns True if deleted, False otherwise.
    """
    if not file_url:
        return False

    logger.info(f"🗑️ Attempting to delete file: {file_url}")
    deleted_local = False
    deleted_remote = False

    try:
        if STORAGE_TYPE == "s3":
            from app.core.object_storage import delete_key_or_url
            deleted_remote = delete_key_or_url(file_url)

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

        return deleted_local or deleted_remote

    except Exception as e:
        logger.error(f"🚨 Unexpected error in delete_file for {file_url}: {e}")
        return False
