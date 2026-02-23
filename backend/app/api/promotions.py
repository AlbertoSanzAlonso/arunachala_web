from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.core.database import get_db, SessionLocal
from app.models.models import Promotion, DashboardActivity
from app.api.auth import get_current_user
from app.core.translation_utils import auto_translate_background
from app.core.webhooks import notify_n8n_content_change
from app.core.image_utils import delete_file

router = APIRouter(tags=["promotions"])

class PromotionBase(BaseModel):
    title: str
    description: Optional[str] = None
    discount_code: Optional[str] = None
    discount_percentage: Optional[int] = None
    image_url: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: bool = True
    translations: Optional[dict] = None

class PromotionCreate(PromotionBase):
    pass

class PromotionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    discount_code: Optional[str] = None
    discount_percentage: Optional[int] = None
    image_url: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None
    translations: Optional[dict] = None

class PromotionResponse(PromotionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

@router.get("/", response_model=List[PromotionResponse])
def get_promotions(db: Session = Depends(get_db)):
    """Public endpoint to get active promotions"""
    now = datetime.now()
    return db.query(Promotion).filter(
        Promotion.is_active == True,
        (Promotion.start_date == None) | (Promotion.start_date <= now),
        (Promotion.end_date == None) | (Promotion.end_date >= now)
    ).all()

@router.get("/all", response_model=List[PromotionResponse])
def get_all_promotions(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Admin endpoint to get all promotions including inactive ones"""
    return db.query(Promotion).all()

@router.get("/{promotion_id}", response_model=PromotionResponse)
def get_promotion(
    promotion_id: int,
    db: Session = Depends(get_db)
):
    """Get single promotion by ID"""
    db_obj = db.query(Promotion).filter(Promotion.id == promotion_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Promotion not found")
    return db_obj

@router.post("/", response_model=PromotionResponse)
async def create_promotion(
    promotion: PromotionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_promotion = Promotion(**promotion.dict())
    db.add(db_promotion)
    db.commit()
    db.refresh(db_promotion)
    
    # Log activity
    activity = DashboardActivity(
        type="promotion",
        action="created",
        title=db_promotion.title,
        entity_id=db_promotion.id
    )
    db.add(activity)
    db.commit()

    # Auto-translate if no translations provided
    if not promotion.translations:
        fields = {
            "title": promotion.title,
            "description": promotion.description,
            "discount_code": promotion.discount_code # Keep context, though usually not translated
        }
        # Filter out None values
        fields = {k: v for k, v in fields.items() if v}
        
        background_tasks.add_task(
            auto_translate_background, 
            SessionLocal, 
            Promotion, 
            db_promotion.id, 
            fields
        )
    
    # Notify n8n for RAG Sync
    await notify_n8n_content_change(db_promotion.id, "promotion", "create", db=db, entity=db_promotion)
    
    return db_promotion

@router.put("/{promotion_id}", response_model=PromotionResponse)
async def update_promotion(
    promotion_id: int,
    promotion_update: PromotionUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_promotion = db.query(Promotion).filter(Promotion.id == promotion_id).first()
    if not db_promotion:
        raise HTTPException(status_code=404, detail="Promotion not found")
    
    update_data = promotion_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_promotion, key, value)
    
    db.commit()
    db.refresh(db_promotion)
    
    # Log activity
    activity = DashboardActivity(
        type="promotion",
        action="updated",
        title=db_promotion.title,
        entity_id=db_promotion.id
    )
    db.add(activity)
    db.commit()

    # Re-translate if main fields changed
    if (promotion_update.title or promotion_update.description):
        fields = {
            "title": promotion_update.title or db_promotion.title,
            "description": promotion_update.description or db_promotion.description,
            "discount_code": promotion_update.discount_code or db_promotion.discount_code
        }
        fields = {k: v for k, v in fields.items() if v}
        background_tasks.add_task(
            auto_translate_background, 
            SessionLocal, 
            Promotion, 
            db_promotion.id, 
            fields
        )
    
    # Notify n8n for RAG Sync
    rag_action = "update" if db_promotion.is_active else "delete"
    await notify_n8n_content_change(db_promotion.id, "promotion", rag_action, db=db, entity=db_promotion)
    
    return db_promotion

@router.delete("/{promotion_id}")
async def delete_promotion(
    promotion_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_promotion = db.query(Promotion).filter(Promotion.id == promotion_id).first()
    if not db_promotion:
        raise HTTPException(status_code=404, detail="Promotion not found")
    
    # Log activity before delete
    activity = DashboardActivity(
        type="promotion",
        action="deleted",
        title=db_promotion.title,
        entity_id=None
    )
    db.add(activity)
    
    if db_promotion.image_url:
        delete_file(db_promotion.image_url)
    
    db.delete(db_promotion)
    db.commit()

    # Notify n8n for RAG Sync
    await notify_n8n_content_change(promotion_id, "promotion", "delete", db=db, entity=db_promotion)

    return {"message": "Promotion deleted"}
