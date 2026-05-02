from fastapi import APIRouter, Depends, HTTPException, status, Request, Query, BackgroundTasks
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.core.database import get_db, SessionLocal
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
            # Update existing vote instead of returning error
            existing.activity_type = activity_type
            existing.custom_suggestion = suggestion.custom_suggestion
            existing.comments = suggestion.comments
            existing.created_at = func.now() if hasattr(func, 'now') else datetime.utcnow()
            db.commit()
            db.refresh(existing)
            return existing

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
    Get all general proposals (without activity_id) individually with their comments
    """
    proposals = db.query(Suggestion).filter(
        Suggestion.activity_id == None,
        Suggestion.activity_type == 'custom',
        Suggestion.custom_suggestion != None,
        Suggestion.custom_suggestion != ''
    ).order_by(Suggestion.created_at.desc()).all()
    
    return [
        {
            "id": p.id,
            "text": p.custom_suggestion,
            "comments": p.comments,
            "status": p.status,
            "date": p.created_at.isoformat() if p.created_at else None
        }
        for p in proposals
    ]

@router.delete("/general-proposals")
def delete_general_proposal(id: int = Query(..., description="ID of the proposal to delete"), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Delete a general proposal by its ID
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    deleted = db.query(Suggestion).filter(
        Suggestion.id == id
    ).delete(synchronize_session=False)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    db.commit()
    return {"message": "Propuesta eliminada correctamente"}

class StatusUpdate(BaseModel):
    status: str

@router.put("/general-proposals/{id}/status")
def update_general_proposal_status(id: int, status_update: StatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Update the status of a general proposal
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    proposal = db.query(Suggestion).filter(Suggestion.id == id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
        
    proposal.status = status_update.status
    db.commit()
    return {"message": "Status updated successfully"}

@router.post("/general-proposals/{id}/share")
def share_general_proposal(id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Share a general proposal as a votable activity with predefined voting options.
    The proposal is deleted from the inbox and converted into a public poll.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    proposal = db.query(Suggestion).filter(Suggestion.id == id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
        
    from app.models.models import Activity
    import re
    import unicodedata
    
    title = proposal.custom_suggestion or "Sugerencia"
    
    # Normalize unicode (accents, tildes, ñ, etc.) to ASCII for URL-safe slug
    normalized = unicodedata.normalize('NFKD', title.lower())
    ascii_title = normalized.encode('ascii', 'ignore').decode('ascii')
    slug = re.sub(r'[^\w\s-]', '', ascii_title)
    slug = re.sub(r'[-\s]+', '-', slug).strip('-')
    if not slug:
        from datetime import datetime
        slug = f"sugerencia-{int(datetime.utcnow().timestamp())}"

    # Ensure slug uniqueness
    base_slug = slug[:80]  # Limit slug length
    slug = base_slug
    counter = 1
    while db.query(Activity).filter(Activity.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    try:    
        new_activity = Activity(
            title=title,
            description=proposal.comments or "\u00bfTe gustar\u00eda que implement\u00e1ramos esta propuesta? \u00a1Vota y cu\u00e9ntanos tu opini\u00f3n!",
            type="sugerencia",
            is_active=True,
            slug=slug,
            translations=None,
            activity_data={
                "options": [
                    {"text": "Sí, me encanta la idea", "icon": "✅"},
                    {"text": "Me gustaría, pero con cambios", "icon": "🔄"},
                    {"text": "No estoy seguro/a", "icon": "🤔"},
                    {"text": "No me interesa", "icon": "❌"}
                ]
            }
        )
        db.add(new_activity)
        
        # Delete the proposal once shared as a poll
        db.delete(proposal)
        db.commit()
        db.refresh(new_activity)
        
        from app.api.activities import notify_subscribers_activity_change
        from app.core.translation_utils import auto_translate_background

        if new_activity.is_active:
            background_tasks.add_task(
                notify_subscribers_activity_change,
                new_activity.id,
                SessionLocal,
                "new"
            )
            
        # Trigger background auto translation
        background_tasks.add_task(
            auto_translate_background,
            SessionLocal,
            Activity,
            new_activity.id,
            {
                "title": title,
                "description": new_activity.description,
                "options": [
                    "Sí, me encanta la idea",
                    "Me gustaría, pero con cambios",
                    "No estoy seguro/a",
                    "No me interesa"
                ]
            }
        )
        
        return {"message": "Sugerencia compartida para votación exitosamente"}
    except Exception as e:
        db.rollback()
        import logging
        logging.getLogger(__name__).error(f"Error sharing proposal {id}: {e}")
        raise HTTPException(status_code=500, detail=f"Error al compartir la sugerencia: {str(e)}")

@router.get("", response_model=List[SuggestionResponse])
def get_suggestions(db: Session = Depends(get_db), limit: int = 100):
    return db.query(Suggestion).order_by(Suggestion.created_at.desc()).limit(limit).all()
