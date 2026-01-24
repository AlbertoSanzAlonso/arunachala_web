from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status, Body
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
    category: str = Form(...),
    alt_text: str = Form(""),
    db: Session = Depends(get_db),
):
    print(f"📤 Upload request received:")
    print(f"   File: {file.filename}")
    print(f"   Content-Type: {file.content_type}")
    print(f"   Category parameter type: {type(category)}")
    print(f"   Category parameter value: '{category}'")
    print(f"   Category repr: {repr(category)}")
    print(f"   Category bytes: {category.encode('utf-8')}")
    
    valid_categories = ["home", "yoga", "massages", "center"]
    if category not in valid_categories:
        print(f"❌ Invalid category: {category}")
        raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of {valid_categories}")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Get max position for this category
    max_pos = db.query(func.max(Gallery.position)).filter(Gallery.category == category).scalar() or 0
    print(f"   Max position for category '{category}': {max_pos}")
    
    # Process and save image to specific folder
    subdirectory = f"gallery/{category}"
    print(f"   Saving to subdirectory: {subdirectory}")
    image_url = save_upload_file(file, subdirectory=subdirectory)
    print(f"   Image saved at: {image_url}")

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
    
    print(f"✅ Image saved to database:")
    print(f"   ID: {new_image.id}")
    print(f"   Category: {new_image.category}")
    print(f"   URL: {new_image.url}")
    print(f"   Position: {new_image.position}")

    return new_image

@router.get("/", response_model=List[GalleryResponse])
def get_gallery_images(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Gallery)
    if category:
        query = query.filter(Gallery.category == category)
    
    return query.order_by(Gallery.position.asc()).all()

@router.post("/reorder")
def reorder_gallery(items: List[ReorderItem], db: Session = Depends(get_db)):
    # Bulk update is more efficient, but let's do simple loop for SQLite compatibility and simplicity
    for item in items:
        db.query(Gallery).filter(Gallery.id == item.id).update({"position": item.position})
    
    db.commit()
    return {"message": "Gallery reordered successfully"}

class BulkDelete(BaseModel):
    ids: List[int]

def delete_physical_file(url: str):
    """Helper to delete file from static folder"""
    try:
        if url.startswith("/static/"):
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            relative_path = url.replace("/static/", "")
            file_path = os.path.join(base_dir, "static", relative_path)
            
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
    except Exception as e:
        print(f"❌ Error deleting file {url}: {e}")
    return False

@router.delete("/{image_id}")
def delete_image(image_id: int, db: Session = Depends(get_db)):
    image = db.query(Gallery).filter(Gallery.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    delete_physical_file(image.url)
    db.delete(image)
    db.commit()
    return {"message": "Image deleted successfully"}

@router.post("/delete-multiple")
def delete_multiple_images(data: BulkDelete, db: Session = Depends(get_db)):
    images = db.query(Gallery).filter(Gallery.id.in_(data.ids)).all()
    
    for image in images:
        delete_physical_file(image.url)
        db.delete(image)
        
    db.commit()
    return {"message": f"{len(images)} images deleted successfully"}

@router.put("/{image_id}/crop", response_model=GalleryResponse)
async def update_cropped_image(
    image_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    image = db.query(Gallery).filter(Gallery.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Delete old file
    delete_physical_file(image.url)
    
    # Save new file in the same category directory
    subdirectory = f"gallery/{image.category}"
    image_url = save_upload_file(file, subdirectory=subdirectory)
    
    # Update DB
    image.url = image_url
    db.commit()
    db.refresh(image)
    
    return image
