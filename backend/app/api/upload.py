
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.api.auth import get_current_user
from app.models.models import User
import os
import uuid
from pydub import AudioSegment
import aiofiles
import re
from unidecode import unidecode
from typing import Optional
import io

def slugify(text: str) -> str:
    """Helper to convert text to SEO friendly slug"""
    text = unidecode(text).lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')

router = APIRouter(prefix="/api/upload", tags=["upload"])

UPLOAD_DIR = "static/audio"
os.makedirs(UPLOAD_DIR, exist_ok=True)

STORAGE_TYPE = os.getenv("STORAGE_TYPE", "local").strip().lower()

@router.post("/audio")
async def upload_audio(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be an audio file")

    file_id = str(uuid.uuid4())
    temp_filename = f"{file_id}_temp"
    final_filename = f"{file_id}.mp3"

    temp_path = os.path.join(UPLOAD_DIR, temp_filename)
    final_path = os.path.join(UPLOAD_DIR, final_filename)

    try:
        async with aiofiles.open(temp_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)

        audio = AudioSegment.from_file(temp_path)

        if audio.channels > 1:
            audio = audio.set_channels(1)

        audio = audio.normalize()

        audio_buffer = io.BytesIO()
        audio.export(
            audio_buffer,
            format="mp3",
            bitrate="96k",
            parameters=["-q:a", "2"]
        )
        audio_bytes = audio_buffer.getvalue()

        if STORAGE_TYPE == "s3":
            from app.core.object_storage import put_bytes
            url = put_bytes(f"audio/{final_filename}", audio_bytes, content_type="audio/mpeg")
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return {"url": url}

        with open(final_path, "wb") as f:
            f.write(audio_bytes)

        if os.path.exists(temp_path):
            os.remove(temp_path)

        return {"url": f"/static/audio/{final_filename}"}

    except HTTPException as he:
        raise he
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        print(f"🔥 Error processing audio: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")


IMAGE_UPLOAD_DIR = "static/gallery/articles"
os.makedirs(IMAGE_UPLOAD_DIR, exist_ok=True)

from PIL import Image


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    folder: str = "articles",
    title: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    ALLOWED_FOLDERS = ["articles", "meditations", "yoga", "therapy", "general"]
    if folder not in ALLOWED_FOLDERS:
        folder = "articles"

    target_dir = f"static/gallery/{folder}"
    os.makedirs(target_dir, exist_ok=True)

    try:
        original_base_name = os.path.splitext(file.filename)[0]
        base_name = slugify(title if title else original_base_name)

        if not base_name:
            base_name = "image"

        file_id = f"{base_name}-{uuid.uuid4().hex[:8]}"
        final_filename = f"{file_id}.webp"
        final_path = os.path.join(target_dir, final_filename)

        content = await file.read()
        image = Image.open(io.BytesIO(content))

        if image.mode in ("RGBA", "P"):
            image = image.convert("RGBA")

        if image.width > 1920:
            ratio = 1920 / image.width
            new_height = int(image.height * ratio)
            image = image.resize((1920, new_height), Image.Resampling.LANCZOS)

        img_buffer = io.BytesIO()
        image.save(img_buffer, "WEBP", quality=80, optimize=True)
        img_bytes = img_buffer.getvalue()

        if STORAGE_TYPE == "s3":
            from app.core.object_storage import put_bytes
            url = put_bytes(
                f"gallery/{folder}/{final_filename}",
                img_bytes,
                content_type="image/webp",
            )
            return {"url": url}

        with open(final_path, "wb") as f:
            f.write(img_bytes)
        return {"url": f"/{target_dir}/{final_filename}"}

    except Exception as e:
        print(f"Error uploading image: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")
