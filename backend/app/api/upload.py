
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.api.auth import get_current_user
from app.models.models import User
import os
import shutil
import uuid
from pydub import AudioSegment
import aiofiles
import re
from unidecode import unidecode
from typing import Optional

def slugify(text: str) -> str:
    """Helper to convert text to SEO friendly slug"""
    text = unidecode(text).lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')

router = APIRouter(prefix="/api/upload", tags=["upload"])

UPLOAD_DIR = "static/audio"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/audio")
async def upload_audio(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # if current_user.role != "admin":
    #     raise HTTPException(status_code=403, detail="Not authorized")

    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be an audio file")

    # Generate unique filename
    file_id = str(uuid.uuid4())
    temp_filename = f"{file_id}_temp"
    final_filename = f"{file_id}.mp3"
    
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)
    final_path = os.path.join(UPLOAD_DIR, final_filename)

    try:
        # Save uploaded file properly using aiofiles
        async with aiofiles.open(temp_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)

        # Convert/Compress using pydub with web optimization
        audio = AudioSegment.from_file(temp_path)
        
        # Optimize for web streaming:
        # 1. Convert to mono (meditation/voice doesn't need stereo)
        if audio.channels > 1:
            audio = audio.set_channels(1)
        
        # 2. Normalize volume to prevent clipping and ensure consistent playback
        audio = audio.normalize()
        
        # 3. Export as MP3 with optimized settings
        # 96k bitrate is perfect for voice/meditation (smaller file, still high quality)
        # Using VBR (variable bitrate) for better quality/size ratio
        audio.export(
            final_path, 
            format="mp3", 
            bitrate="96k",
            parameters=["-q:a", "2"]  # VBR quality level (0-9, 2 is high quality)
        )
        
        # Clean up temp file
        os.remove(temp_path)
        
        # Return URL
        return {"url": f"/static/audio/{final_filename}"}

    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")


# Image Upload Configuration
IMAGE_UPLOAD_DIR = "static/gallery/articles"
os.makedirs(IMAGE_UPLOAD_DIR, exist_ok=True)

from PIL import Image
import io

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    folder: str = "articles",
    title: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    # if current_user.role != "admin":
    #     raise HTTPException(status_code=403, detail="Not authorized")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Validate allowed folders to prevent directory traversal or clutter
    ALLOWED_FOLDERS = ["articles", "meditations", "yoga", "therapy", "general"]
    if folder not in ALLOWED_FOLDERS:
        folder = "articles" # Fallback to default

    target_dir = f"static/gallery/{folder}"
    os.makedirs(target_dir, exist_ok=True)

    try:
        # Generate SEO friendly filename
        # Use title if provided, otherwise original filename (without extension)
        original_base_name = os.path.splitext(file.filename)[0]
        base_name = slugify(title if title else original_base_name)
        
        # If result is empty after slugifying, fallback to generic
        if not base_name:
            base_name = "image"
            
        # Add 8 chars of UUID to ensure uniqueness even with same titles
        file_id = f"{base_name}-{uuid.uuid4().hex[:8]}"
        final_filename = f"{file_id}.webp"
        final_path = os.path.join(target_dir, final_filename)

        # Read image
        content = await file.read()
        image = Image.open(io.BytesIO(content))

        # Convert to RGB if necessary (e.g. for PNG with transparency being saved as WebP/JPEG)
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGBA") # WebP supports transparency

        # Resize if too huge (optional, let's keep it safe max 1920px width)
        if image.width > 1920:
            ratio = 1920 / image.width
            new_height = int(image.height * ratio)
            image = image.resize((1920, new_height), Image.Resampling.LANCZOS)

        # Save as WebP
        image.save(final_path, "WEBP", quality=80, optimize=True)

        return {"url": f"/{target_dir}/{final_filename}"}

    except Exception as e:
        print(f"Error uploading image: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")
