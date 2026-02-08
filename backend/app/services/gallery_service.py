from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import UploadFile, HTTPException
from app.models.models import Gallery
from app.core.image_utils import save_upload_file
import os
from typing import List

class GalleryService:
    def __init__(self, db: Session):
        self.db = db

    def _delete_physical_file(self, url: str) -> bool:
        """Helper to delete file from static folder"""
        try:
            if url.startswith("/static/"):
                # Calculate backend root directory: 
                # file is in /app/services/gallery_service.py
                # 3 levels up: /app/services -> /app -> /backend
                base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                relative_path = url.replace("/static/", "")
                file_path = os.path.join(base_dir, "static", relative_path)
                
                if os.path.exists(file_path):
                    os.remove(file_path)
                    return True
        except Exception as e:
            print(f"❌ Error deleting file {url}: {e}")
        return False

    def get_images(self, category: str = None) -> List[Gallery]:
        query = self.db.query(Gallery)
        if category:
            query = query.filter(Gallery.category == category)
        return query.order_by(Gallery.position.asc()).all()

    def upload_images_bulk(self, files: List[UploadFile], category: str) -> List[Gallery]:
        results = []
        for file in files:
            try:
                # We reuse the existing upload_image logic for each file
                results.append(self.upload_image(file, category))
            except Exception as e:
                print(f"❌ Error uploading file in bulk: {e}")
                # Continue with others even if one fails
        return results

    def upload_image(self, file: UploadFile, category: str, alt_text: str = "") -> Gallery:
        valid_categories = ["home", "yoga", "therapies", "center"]
        if category not in valid_categories:
            print(f"❌ Invalid category attempt: {category}")
            raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of {valid_categories}")

        if not file.content_type.startswith("image/"):
            print(f"❌ Invalid file type: {file.content_type}")
            raise HTTPException(status_code=400, detail="File must be an image")

        # Get max position
        max_pos = self.db.query(func.max(Gallery.position)).filter(Gallery.category == category).scalar() or 0
        
        # Save file
        subdirectory = f"gallery/{category}"
        image_url = save_upload_file(file, subdirectory=subdirectory)

        # Create DB Entry
        new_image = Gallery(
            url=image_url,
            alt_text=alt_text,
            category=category,
            position=max_pos + 1
        )
        self.db.add(new_image)
        self.db.commit()
        self.db.refresh(new_image)
        return new_image

    def reorder_images(self, items: List[dict]):
        # items is a list of objects with 'id' and 'position'
        for item in items:
            self.db.query(Gallery).filter(Gallery.id == item['id']).update({"position": item['position']})
        self.db.commit()

    def delete_image(self, image_id: int):
        image = self.db.query(Gallery).filter(Gallery.id == image_id).first()
        if not image:
            raise HTTPException(status_code=404, detail="Image not found")
        
        self._delete_physical_file(image.url)
        self.db.delete(image)
        self.db.commit()

    def delete_multiple_images(self, image_ids: List[int]) -> int:
        images = self.db.query(Gallery).filter(Gallery.id.in_(image_ids)).all()
        count = len(images)
        for image in images:
            self._delete_physical_file(image.url)
            self.db.delete(image)
        self.db.commit()
        return count

    def crop_update_image(self, image_id: int, file: UploadFile) -> Gallery:
        image = self.db.query(Gallery).filter(Gallery.id == image_id).first()
        if not image:
            raise HTTPException(status_code=404, detail="Image not found")
        
        # Delete old file
        self._delete_physical_file(image.url)
        
        # Save new file
        subdirectory = f"gallery/{image.category}"
        image_url = save_upload_file(file, subdirectory=subdirectory)
        
        # Update DB
        image.url = image_url
        self.db.commit()
        self.db.refresh(image)
        return image

    def update_image(self, image_id: int, alt_text: str = None) -> Gallery:
        image = self.db.query(Gallery).filter(Gallery.id == image_id).first()
        if not image:
            raise HTTPException(status_code=404, detail="Image not found")
        
        if alt_text is not None:
            image.alt_text = alt_text
            
        self.db.commit()
        self.db.refresh(image)
        return image
