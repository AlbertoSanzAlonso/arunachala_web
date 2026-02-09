from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.core.database import get_db
from app.models.models import Suggestion, User
from app.api.auth import get_current_user

router = APIRouter(prefix="/api/suggestions", tags=["suggestions"])

class SuggestionCreate(BaseModel):
    activity_type: Optional[str] = None
    custom_suggestion: Optional[str] = None
    comments: Optional[str] = None

class SuggestionResponse(BaseModel):
    id: int
    activity_type: Optional[str] = None
    custom_suggestion: Optional[str] = None
    comments: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("", response_model=SuggestionResponse)
def create_suggestion(suggestion: SuggestionCreate, db: Session = Depends(get_db)):
    new_suggestion = Suggestion(
        activity_type=suggestion.activity_type,
        custom_suggestion=suggestion.custom_suggestion,
        comments=suggestion.comments
    )
    db.add(new_suggestion)
    db.commit()
    db.refresh(new_suggestion)
    return new_suggestion

@router.get("", response_model=List[SuggestionResponse])
def get_suggestions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(Suggestion).order_by(Suggestion.created_at.desc()).all()
