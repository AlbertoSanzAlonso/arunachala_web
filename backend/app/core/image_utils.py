import os
import uuid
import io
import re
import logging
from PIL import Image, ImageOps
from fastapi import UploadFile, HTTPException
from unidecode import unidecode

# Point to /backend/static/ instead of /backend/app/static/
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "static")

STORAGE_TYPE = os.getenv("STORAGE_TYPE", "local").strip().lower()
if STORAGE_TYPE not in ("local", "s3"):
    STORAGE_TYPE = "local"

logger = logging.getLogger("uvicorn.error")

# Photos from a camera are several MB at quality 80 if we keep the original pixels.
# 1920px on the long edge is enough for a full-bleed gallery or hero on a desktop screen.
MAX_IMAGE_EDGE = 1920
WEBP_QUALITY = 75
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tif", ".tiff"}


def is_image_upload(upload_file: UploadFile) -> bool:
    """True for gallery/hero uploads even when the browser omits Content-Type."""
    content_type = (upload_file.content_type or "").lower()
    if content_type.startswith("image/"):
        return True
    ext = os.path.splitext(upload_file.filename or "")[1].lower()
    return ext in IMAGE_EXTENSIONS


def prepare_web_image(image: Image.Image, max_edge: int = MAX_IMAGE_EDGE) -> Image.Image:
    """Apply EXIF orientation and downscale so the browser does not fetch multi-MB photos."""
    image = ImageOps.exif_transpose(image)
    if max(image.size) > max_edge:
        image.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)
    return image


def encode_lightweight_webp(image: Image.Image) -> bytes:
    """Single encoder for gallery, hero and article images: WebP, max 1920px."""
    image = prepare_web_image(image)
    if image.mode == "P":
        image = image.convert("RGBA" if "transparency" in image.info else "RGB")
    elif image.mode == "CMYK":
        image = image.convert("RGB")
    elif image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGB")

    buffer = io.BytesIO()
    image.save(buffer, format="WEBP", quality=WEBP_QUALITY, method=6)
    return buffer.getvalue()


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

        is_image = is_image_upload(upload_file)

        if is_image:
            filename = f"{base_name}-{uuid.uuid4().hex[:8]}.webp"
            upload_file.file.seek(0)
            webp_bytes = encode_lightweight_webp(Image.open(upload_file.file))
        else:
            filename = f"{base_name}-{uuid.uuid4().hex[:8]}{original_ext}"
            upload_file.file.seek(0)
            file_content = upload_file.file.read()

        if STORAGE_TYPE == "s3":
            from app.core.object_storage import put_bytes
            file_path = f"{subdirectory}/{filename}"
            if is_image:
                return put_bytes(file_path, webp_bytes, content_type="image/webp")
            return put_bytes(
                file_path,
                file_content,
                content_type=upload_file.content_type or "application/octet-stream",
            )

        destination_dir = os.path.join(STATIC_DIR, subdirectory)
        os.makedirs(destination_dir, exist_ok=True)
        file_location = os.path.join(destination_dir, filename)

        if is_image:
            with open(file_location, "wb") as f:
                f.write(webp_bytes)
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

        webp_bytes = encode_lightweight_webp(Image.open(io.BytesIO(content)))

        if STORAGE_TYPE == "s3":
            from app.core.object_storage import put_bytes
            return put_bytes(f"{subdirectory}/{filename}", webp_bytes, content_type="image/webp")

        destination_dir = os.path.join(STATIC_DIR, subdirectory)
        os.makedirs(destination_dir, exist_ok=True)
        file_location = os.path.join(destination_dir, filename)
        with open(file_location, "wb") as f:
            f.write(webp_bytes)
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
