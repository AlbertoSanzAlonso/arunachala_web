from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.core.database import get_db
from app.models.models import Suggestion, User
from app.api.auth import get_current_user

router = APIRouter(prefix="/api/suggestions", tags=["suggestions"])

class SuggestionCreate(BaseModel):
    activity_id: Optional[int] = None
    activity_type: Optional[str] = None
    custom_suggestion: Optional[str] = None
    comments: Optional[str] = None

class SuggestionResponse(BaseModel):
    id: int
    activity_id: Optional[int] = None
    activity_type: Optional[str] = None
    custom_suggestion: Optional[str] = None
    comments: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("", response_model=SuggestionResponse)
def create_suggestion(request: Request, suggestion: SuggestionCreate, db: Session = Depends(get_db)):
    # Get client IP (considering proxy headers if present)
    ip_address = request.headers.get("x-forwarded-for")
    if ip_address:
        ip_address = ip_address.split(",")[0].strip()
    else:
        ip_address = request.client.host if request.client else "unknown"

    # Restriction: Only one vote per IP for each specific activity (poll)
    # Note: No restriction for general proposals (activity_id == None)
    # Users can submit multiple different proposals
    if suggestion.activity_id:
        existing = db.query(Suggestion).filter(
            Suggestion.activity_id == suggestion.activity_id,
            Suggestion.ip_address == ip_address
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya has registrado un voto para esta actividad."
            )

    # If no activity_id, this is a general proposal - set activity_type to 'custom'
    activity_type = suggestion.activity_type
    if not suggestion.activity_id:
        activity_type = 'custom'
    
    new_suggestion = Suggestion(
        activity_id=suggestion.activity_id,
        activity_type=activity_type,
        custom_suggestion=suggestion.custom_suggestion,
        comments=suggestion.comments,
        ip_address=ip_address
    )

    db.add(new_suggestion)
    db.commit()
    db.refresh(new_suggestion)
    return new_suggestion

@router.get("/custom-proposals/{activity_id}")
def get_custom_proposals(activity_id: int, db: Session = Depends(get_db)):
    """
    Get all unique custom proposals for a specific activity with their vote counts
    """
    from sqlalchemy import func
    
    # Query to get custom suggestions grouped by text with counts
    proposals = db.query(
        Suggestion.custom_suggestion,
        func.count(Suggestion.id).label('vote_count')
    ).filter(
        Suggestion.activity_id == activity_id,
        Suggestion.activity_type == 'custom',
        Suggestion.custom_suggestion != None,
        Suggestion.custom_suggestion != ''
    ).group_by(
        Suggestion.custom_suggestion
    ).order_by(
        func.count(Suggestion.id).desc()
    ).all()
    
    return [
        {
            "text": proposal[0],
            "votes": proposal[1]
        }
        for proposal in proposals
    ]

@router.get("/general-proposals")
def get_general_proposals(db: Session = Depends(get_db)):
    """
    Get all general proposals (without activity_id) grouped by text with their counts
    """
    from sqlalchemy import func
    
    # Query to get general custom suggestions grouped by text with counts
    proposals = db.query(
        Suggestion.custom_suggestion,
        func.count(Suggestion.id).label('count'),
        func.max(Suggestion.created_at).label('latest_date')
    ).filter(
        Suggestion.activity_id == None,
        Suggestion.activity_type == 'custom',
        Suggestion.custom_suggestion != None,
        Suggestion.custom_suggestion != ''
    ).group_by(
        Suggestion.custom_suggestion
    ).order_by(
        func.max(Suggestion.created_at).desc()
    ).all()
    
    return [
        {
            "text": proposal[0],
            "votes": proposal[1],
            "date": proposal[2]
        }
        for proposal in proposals
    ]

@router.get("", response_model=List[SuggestionResponse])
def get_suggestions(db: Session = Depends(get_db), limit: int = 100):
    return db.query(Suggestion).order_by(Suggestion.created_at.desc()).limit(limit).all()
