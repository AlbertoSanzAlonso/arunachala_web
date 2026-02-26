from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, date
import random

from app.core.database import get_db
from app.models.models import Mantra, Personalization, User
from app.api.auth import get_current_admin_user

router = APIRouter(tags=["mantras"])

class MantraSchema(BaseModel):
    id: int
    text_sanskrit: str
    translation: str
    is_predefined: bool
    is_active: bool

    class Config:
        from_attributes = True

class MantraCreate(BaseModel):
    text_sanskrit: str
    translation: str

@router.get("/daily", response_model=MantraSchema)
def get_daily_mantra(db: Session = Depends(get_db)):
    """
    Get the mantra of the day. 
    Logic: 
    1. Check site_config for 'daily_mantra_id' and 'daily_mantra_date'.
    2. If date matches today, return that mantra.
    3. If not, pick a random active mantra, update site_config, return it.
    """
    today_str = date.today().isoformat()
    
    # Get config variables
    mantra_id_cfg = db.query(Personalization).filter(Personalization.key == "daily_mantra_id").first()
    mantra_date_cfg = db.query(Personalization).filter(Personalization.key == "daily_mantra_date").first()
    
    # If we have a valid mantra for today
    if mantra_id_cfg and mantra_date_cfg and mantra_date_cfg.value == today_str:
        mantra = db.query(Mantra).filter(Mantra.id == int(mantra_id_cfg.value), Mantra.is_active == True).first()
        if mantra:
            return mantra

    # Otherwise, pick a random one
    mantras = db.query(Mantra).filter(Mantra.is_active == True).all()
    if not mantras:
        # Emergency fallback if table is empty (shouldn't happen with seed)
        return {
            "id": 0, 
            "text_sanskrit": "Lokah Samastah Sukhino Bhavantu", 
            "translation": "Que todos los seres sean felices y libres",
            "is_predefined": True,
            "is_active": True
        }
    
    selected = random.choice(mantras)
    
    # Update config
    if not mantra_id_cfg:
        mantra_id_cfg = Personalization(key="daily_mantra_id", value=str(selected.id))
        db.add(mantra_id_cfg)
    else:
        mantra_id_cfg.value = str(selected.id)
        
    if not mantra_date_cfg:
        mantra_date_cfg = Personalization(key="daily_mantra_date", value=today_str)
        db.add(mantra_date_cfg)
    else:
        mantra_date_cfg.value = today_str
        
    db.commit()
    return selected

@router.post("/regenerate", response_model=MantraSchema)
def regenerate_daily_mantra(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Admin only: Force pick a different random mantra for today"""
    # Get current mantra ID to avoid picking the same one if possible
    mantra_id_cfg = db.query(Personalization).filter(Personalization.key == "daily_mantra_id").first()
    current_id = int(mantra_id_cfg.value) if mantra_id_cfg and mantra_id_cfg.value else None
    
    query = db.query(Mantra).filter(Mantra.is_active == True)
    if current_id:
        query = query.filter(Mantra.id != current_id)
        
    mantras = query.all()
    if not mantras:
        # If only one mantra exists, just return it
        mantras = db.query(Mantra).filter(Mantra.is_active == True).all()
        
    if not mantras:
        # Emergency fallback if table is empty
        return {
            "id": 0, 
            "text_sanskrit": "Lokah Samastah Sukhino Bhavantu", 
            "translation": "Que todos los seres sean felices y libres",
            "is_predefined": True,
            "is_active": True
        }
        
    selected = random.choice(mantras)
    
    # Update config
    today_str = date.today().isoformat()
    
    if not mantra_id_cfg:
        mantra_id_cfg = Personalization(key="daily_mantra_id", value=str(selected.id))
        db.add(mantra_id_cfg)
    else:
        mantra_id_cfg.value = str(selected.id)
        
    mantra_date_cfg = db.query(Personalization).filter(Personalization.key == "daily_mantra_date").first()
    if not mantra_date_cfg:
        mantra_date_cfg = Personalization(key="daily_mantra_date", value=today_str)
        db.add(mantra_date_cfg)
    else:
        mantra_date_cfg.value = today_str
        
    db.commit()
    return selected

@router.get("", response_model=List[MantraSchema])
def list_mantras(db: Session = Depends(get_db)):
    return db.query(Mantra).order_by(Mantra.is_predefined.desc(), Mantra.id.asc()).all()

@router.post("", response_model=MantraSchema)
def create_or_update_mantra(
    data: MantraCreate,
    set_as_daily: bool = Query(False),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    # Check if a mantra with same text exists
    mantra = db.query(Mantra).filter(Mantra.text_sanskrit == data.text_sanskrit).first()
    if mantra:
        mantra.translation = data.translation
        mantra.is_active = True
    else:
        mantra = Mantra(
            text_sanskrit=data.text_sanskrit,
            translation=data.translation,
            is_predefined=False
        )
        db.add(mantra)
    
    db.commit()
    db.refresh(mantra)
    
    if set_as_daily:
        today_str = date.today().isoformat()
        
        m_id_cfg = db.query(Personalization).filter(Personalization.key == "daily_mantra_id").first()
        if not m_id_cfg:
            db.add(Personalization(key="daily_mantra_id", value=str(mantra.id)))
        else:
            m_id_cfg.value = str(mantra.id)
            
        m_date_cfg = db.query(Personalization).filter(Personalization.key == "daily_mantra_date").first()
        if not m_date_cfg:
            db.add(Personalization(key="daily_mantra_date", value=today_str))
        else:
            m_date_cfg.value = today_str
        
        db.commit()
        
    return mantra

@router.delete("/{mantra_id}")
def delete_mantra(
    mantra_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    mantra = db.query(Mantra).filter(Mantra.id == mantra_id).first()
    if not mantra:
        raise HTTPException(status_code=404, detail="Mantra not found")
        
    db.delete(mantra)
    db.commit()
    return {"message": "Mantra deleted"}
