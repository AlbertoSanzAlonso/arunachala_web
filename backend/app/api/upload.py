
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.api.auth import get_current_user
from app.models.models import User
import os
import shutil
import uuid
from pydub import AudioSegment
import aiofiles

router = APIRouter(prefix="/api/upload", tags=["upload"])

UPLOAD_DIR = "static/audio"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/audio")
async def upload_audio(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

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

        # Convert/Compress using pydub
        audio = AudioSegment.from_file(temp_path)
        
        # Export as MP3 with optimized settings (128k bitrate is good for voice/music balance on web)
        audio.export(final_path, format="mp3", bitrate="128k")
        
        # Clean up temp file
        os.remove(temp_path)
        
        # Return URL
        return {"url": f"/static/audio/{final_filename}"}

    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")
