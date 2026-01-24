from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Body
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.models import Gallery
from app.api.auth import oauth2_scheme
from app.core.image_utils import save_upload_file
from pydantic import BaseModel
from typing import List, Optional
import os

router = APIRouter()

class GalleryResponse(BaseModel):
    id: int
    url: str
    alt_text: Optional[str] = None
    category: Optional[str] = None
    position: int

    class Config:
        from_attributes = True

class ReorderItem(BaseModel):
    id: int
    position: int

@router.post("/upload", response_model=GalleryResponse)
async def upload_image(
    file: UploadFile = File(...),
    alt_text: str = "",
    category: str = "general",
    db: Session = Depends(get_db),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Get max position to append to the end
    max_pos = db.query(func.max(Gallery.position)).scalar() or 0
    
    # Process and save image
    image_url = save_upload_file(file)

    # Save to DB
    new_image = Gallery(
        url=image_url,
        alt_text=alt_text,
        category=category,
        position=max_pos + 1
    )
    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    return new_image

@router.get("/", response_model=List[GalleryResponse])
def get_gallery_images(db: Session = Depends(get_db)):
    # Return images sorted by position ascending
    return db.query(Gallery).order_by(Gallery.position.asc()).all()

@router.post("/reorder")
def reorder_gallery(items: List[ReorderItem], db: Session = Depends(get_db)):
    # Bulk update is more efficient, but let's do simple loop for SQLite compatibility and simplicity
    for item in items:
        db.query(Gallery).filter(Gallery.id == item.id).update({"position": item.position})
    
    db.commit()
    return {"message": "Gallery reordered successfully"}

@router.delete("/{image_id}")
def delete_image(image_id: int, db: Session = Depends(get_db)):
    image = db.query(Gallery).filter(Gallery.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Try to delete file from disk
    # Assuming url is like /static/uploads/filename.webp
    try:
        if image.url.startswith("/static/"):
            file_path = f"app{image.url}" # app/static/...
            if os.path.exists(file_path):
                os.remove(file_path)
    except Exception as e:
        print(f"Error deleting file: {e}")

    db.delete(image)
    db.commit()
    return {"message": "Image deleted successfully"}
