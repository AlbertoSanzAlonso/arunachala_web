from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import oauth2_scheme
from app.services.gallery_service import GalleryService
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# DTOs
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

class BulkDelete(BaseModel):
    ids: List[int]

class UpdateGalleryItem(BaseModel):
    alt_text: Optional[str] = None

# Dependency Helper
def get_service(db: Session = Depends(get_db)) -> GalleryService:
    return GalleryService(db)

@router.post("/upload", response_model=GalleryResponse)
async def upload_image(
    file: UploadFile = File(...),
    category: str = Form(...),
    alt_text: str = Form(""),
    service: GalleryService = Depends(get_service),
):
    return service.upload_image(file, category, alt_text)

@router.post("/upload-bulk", response_model=List[GalleryResponse])
async def upload_images_bulk(
    files: List[UploadFile] = File(...),
    category: str = Form(...),
    service: GalleryService = Depends(get_service),
):
    return service.upload_images_bulk(files, category)

@router.get("/", response_model=List[GalleryResponse])
def get_gallery_images(
    category: Optional[str] = None, 
    service: GalleryService = Depends(get_service)
):
    return service.get_images(category)

@router.post("/reorder")
def reorder_gallery(
    items: List[ReorderItem], 
    service: GalleryService = Depends(get_service)
):
    # Convert Pydantic models to dicts for service
    items_dict = [{"id": item.id, "position": item.position} for item in items]
    service.reorder_images(items_dict)
    return {"message": "Gallery reordered successfully"}

@router.delete("/{image_id}")
def delete_image(
    image_id: int, 
    service: GalleryService = Depends(get_service)
):
    service.delete_image(image_id)
    return {"message": "Image deleted successfully"}

@router.post("/delete-multiple")
def delete_multiple_images(
    data: BulkDelete, 
    service: GalleryService = Depends(get_service)
):
    count = service.delete_multiple_images(data.ids)
    return {"message": f"{count} images deleted successfully"}

@router.put("/{image_id}/crop", response_model=GalleryResponse)
async def update_cropped_image(
    image_id: int,
    file: UploadFile = File(...),
    service: GalleryService = Depends(get_service),
):
    return service.crop_update_image(image_id, file)

@router.put("/{image_id}", response_model=GalleryResponse)
def update_image_details(
    image_id: int,
    data: UpdateGalleryItem,
    service: GalleryService = Depends(get_service)
):
    return service.update_image(image_id, alt_text=data.alt_text)
