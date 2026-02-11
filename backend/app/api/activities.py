from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.core.database import get_db, SessionLocal
from app.models.models import Activity, User, Suggestion
from app.api.auth import get_current_user
from app.core.image_utils import save_upload_file, delete_file
from app.core.webhooks import notify_n8n_content_change
from app.core.translation_utils import auto_translate_background
from app.core.schedule_utils import check_global_overlap
import json
from sqlalchemy import func
from app.models.models import Gallery, DashboardActivity


router = APIRouter(prefix="/api/activities", tags=["activities"])

# Pydantic Schemas
class ActivityResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    translations: Optional[dict] = None
    type: str # 'curso', 'taller', 'evento', 'retiro', 'sugerencia'
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    location: Optional[str] = None
    price: Optional[str] = None
    image_url: Optional[str] = None
    activity_data: Optional[dict] = None
    slug: Optional[str] = None
    is_active: bool = True
    is_finished_acknowledged: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None
    vote_results: Optional[dict] = None
    user_comments: Optional[List[dict]] = None


    class Config:
        from_attributes = True

# Helper for validation
def validate_course_schedule(db: Session, activity_data_str: str | None, type: str, exclude_id: int = None):
    """
    Validates that a course schedule doesn't overlap with existing classes or courses.
    Raises HTTPException(400) if overlap is detected.
    """
    if type != 'curso' or not activity_data_str:
        return

    try:
        data = json.loads(activity_data_str)
    except json.JSONDecodeError:
        # Invalid JSON, will fail later in the flow
        return
    
    if 'schedule' not in data or not isinstance(data['schedule'], list):
        return
    
    for session in data['schedule']:
        day = session.get('day')
        time = session.get('time')
        
        # Safely handle duration, default to 60 if missing or invalid
        try:
            duration = int(session.get('duration', 60))
        except (ValueError, TypeError):
            duration = 60
        
        if not day or not time:
            continue
        
        # Calculate end time
        try:
            h, m = map(int, time.split(':'))
        except (ValueError, AttributeError):
            # Invalid time format, skip this session
            continue
            
        total_min = h * 60 + m + duration
        end_h = (total_min // 60) % 24
        end_m = total_min % 60
        end_time = f"{end_h:02d}:{end_m:02d}"

        # Check for overlap - this will raise HTTPException if found
        overlap = check_global_overlap(
            db, day, time, end_time, 
            exclude_type='activity', 
            exclude_id=exclude_id
        )
        
        if overlap.exists:
            raise HTTPException(
                status_code=400, 
                detail=f"Conflicto de horario: Ya existe '{overlap.name}' el {day} de {overlap.start} a {overlap.end}."
            )

@router.get("", response_model=List[ActivityResponse])
def get_activities(db: Session = Depends(get_db), active_only: bool = True):
    query = db.query(Activity)
    if active_only:
        now = datetime.utcnow()
        # Proactive cleanup: Delete courses that have end_date in the past
        # Note: We only delete if they are expired and should not be showing
        expired_courses = db.query(Activity).filter(
            Activity.type == 'curso',
            Activity.end_date != None,
            Activity.end_date < now
        ).all()
        
        for expired in expired_courses:
            if expired.image_url:
                delete_file(expired.image_url)
            db.delete(expired)
        
        if expired_courses:
            db.commit()

        query = query.filter(Activity.is_active == True)
        # Filter out activities that have an end_date that has passed (fallback)
        query = query.filter((Activity.end_date == None) | (Activity.end_date >= now))
    
    activities = query.order_by(Activity.start_date.asc().nulls_last(), Activity.created_at.desc()).all()
    
    # Enrich suggestion activities with vote data
    for activity in activities:
        if activity.type == 'sugerencia':
            # Calculate vote results
            votes = db.query(Suggestion.activity_type, func.count(Suggestion.id))\
                      .filter(Suggestion.activity_id == activity.id)\
                      .group_by(Suggestion.activity_type).all()
            activity.vote_results = {v[0]: v[1] for v in votes if v[0]}
            
            # Fetch all suggestions for this activity
            suggestions = db.query(Suggestion)\
                         .filter(Suggestion.activity_id == activity.id)\
                         .order_by(Suggestion.created_at.desc()).all()
            
            activity.user_comments = []
            
            # Group custom suggestions by text with vote counts
            custom_proposals = {}
            regular_comments = []
            
            for s in suggestions:
                if s.activity_type == 'custom' and s.custom_suggestion:
                    # Group custom proposals
                    proposal_text = s.custom_suggestion.strip()
                    if proposal_text not in custom_proposals:
                        custom_proposals[proposal_text] = {
                            'text': proposal_text,
                            'votes': 0,
                            'date': s.created_at
                        }
                    custom_proposals[proposal_text]['votes'] += 1
                    # Keep the most recent date
                    if s.created_at > custom_proposals[proposal_text]['date']:
                        custom_proposals[proposal_text]['date'] = s.created_at
                else:
                    # Regular comments (non-custom)
                    text = s.comments or ""
                    if text:
                        regular_comments.append({
                            "text": text,
                            "option": s.activity_type,
                            "date": s.created_at
                        })
            
            # Add grouped custom proposals to user_comments
            for proposal_text, proposal_data in sorted(custom_proposals.items(), key=lambda x: x[1]['votes'], reverse=True):
                activity.user_comments.append({
                    "text": proposal_data['text'],
                    "option": "custom",
                    "votes": proposal_data['votes'],
                    "date": proposal_data['date']
                })
            
            # Add regular comments
            activity.user_comments.extend(regular_comments)
        
    return activities

@router.get("/featured", response_model=List[ActivityResponse])
def get_featured_activities(db: Session = Depends(get_db)):
    """
    Get activities marked as featured (has_reminder=true in activity_data).
    Only returns active activities of type taller, evento, or retiro.
    """
    now = datetime.utcnow()
    
    # Get all active activities (excluding sugerencias and cursos)
    activities = db.query(Activity).filter(
        Activity.is_active == True,
        Activity.type.in_(['taller', 'evento', 'retiro']),
        (Activity.end_date == None) | (Activity.end_date >= now)
    ).order_by(Activity.start_date.asc().nulls_last()).all()
    
    # Filter activities that have has_reminder=true in activity_data
    featured = []
    for activity in activities:
        if activity.activity_data and isinstance(activity.activity_data, dict):
            if activity.activity_data.get('has_reminder') is True:
                featured.append(activity)
    
    return featured


@router.get("/{activity_id}", response_model=ActivityResponse)
def get_activity(activity_id: int, db: Session = Depends(get_db)):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    if activity.type == 'sugerencia':
        votes = db.query(Suggestion.activity_type, func.count(Suggestion.id))\
                  .filter(Suggestion.activity_id == activity.id)\
                  .group_by(Suggestion.activity_type).all()
        activity.vote_results = {v[0]: v[1] for v in votes if v[0]}
        
        # Fetch all suggestions for this activity
        suggestions = db.query(Suggestion)\
                     .filter(Suggestion.activity_id == activity.id)\
                     .order_by(Suggestion.created_at.desc()).all()
        
        activity.user_comments = []
        
        # Group custom suggestions by text with vote counts
        custom_proposals = {}
        regular_comments = []
        
        for s in suggestions:
            if s.activity_type == 'custom' and s.custom_suggestion:
                # Group custom proposals
                proposal_text = s.custom_suggestion.strip()
                if proposal_text not in custom_proposals:
                    custom_proposals[proposal_text] = {
                        'text': proposal_text,
                        'votes': 0,
                        'date': s.created_at
                    }
                custom_proposals[proposal_text]['votes'] += 1
                # Keep the most recent date
                if s.created_at > custom_proposals[proposal_text]['date']:
                    custom_proposals[proposal_text]['date'] = s.created_at
            else:
                # Regular comments (non-custom)
                text = s.comments or ""
                if text:
                    regular_comments.append({
                        "text": text,
                        "option": s.activity_type,
                        "date": s.created_at
                    })
        
        # Add grouped custom proposals to user_comments
        for proposal_text, proposal_data in sorted(custom_proposals.items(), key=lambda x: x[1]['votes'], reverse=True):
            activity.user_comments.append({
                "text": proposal_data['text'],
                "option": "custom",
                "votes": proposal_data['votes'],
                "date": proposal_data['date']
            })
        
        # Add regular comments
        activity.user_comments.extend(regular_comments)
        
    return activity

@router.post("", response_model=ActivityResponse)
async def create_activity(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    description: str = Form(None),
    translations: str = Form(None),
    activity_data: str = Form(None),
    type: str = Form(...),
    start_date: str = Form(None),
    end_date: str = Form(None),
    location: str = Form(None),
    price: str = Form(None),
    slug: str = Form(None),
    image: UploadFile = File(None),
    is_active: bool = Form(True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Validate overlap for courses
    validate_course_schedule(db, activity_data, type)

    image_url = None
    if image:
        subdir = "gallery/suggestions" if type == 'sugerencia' else "gallery/activities"
        image_url = save_upload_file(image, subdirectory=subdir)

    # Handle dates
    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date) if end_date else None
    
    # Generate slug if not provided - use title as base
    final_slug = slug
    if not final_slug or (isinstance(final_slug, str) and not final_slug.strip()):
        import re
        final_slug = re.sub(r'[^\w\s-]', '', title.lower())
        final_slug = re.sub(r'[-\s]+', '-', final_slug).strip('-')
        # Fallback if still empty
        if not final_slug:
            final_slug = f"activity-{int(datetime.utcnow().timestamp())}"

    new_activity = Activity(
        title=title,
        description=description or "",
        translations=json.loads(translations) if translations else None,
        activity_data=json.loads(activity_data) if activity_data else None,
        type=type,
        start_date=start_dt,
        end_date=end_dt,
        location=location or "",
        price=price or "",
        image_url=image_url,
        slug=final_slug,
        is_active=is_active,
        needs_reindex=True  # Mark for RAG sync on creation
    )
    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)
    
    # Register in Gallery if image exists
    if image_url:
        gallery_item = Gallery(
            url=image_url,
            alt_text=f"Imagen para {title}",
            category="sugerencias" if type == 'sugerencia' else "actividades"
        )
        db.add(gallery_item)
        db.commit()
    
    # Log to dashboard activity
    type_labels = {
        'sugerencia': 'sugerencia',
        'curso': 'curso',
        'taller': 'taller',
        'evento': 'evento',
        'retiro': 'retiro'
    }
    label = type_labels.get(type, 'actividad')
    prefix = "Nueva" if type in ['sugerencia', 'actividad'] else "Nuevo"
    
    activity_log = DashboardActivity(
        type='activity',
        action='created',
        title=f"{prefix} {label}: {title}",
        entity_id=new_activity.id
    )
    db.add(activity_log)
    db.commit()

    # Notify RAG system (n8n) with complete entity
    await notify_n8n_content_change(new_activity.id, "activity", "create", db=db, entity=new_activity)
    
    # Auto-translate if no translations provided
    if not translations and background_tasks:
        # Use RAW activity_data from form to avoid DB state issues
        translation_fields = {"title": title}
        if description:
            translation_fields["description"] = description
        
        try:
            # Parse the raw JSON string received from React
            raw_ad = json.loads(activity_data) if activity_data else {}
            if isinstance(raw_ad, dict) and "options" in raw_ad:
                opts = raw_ad["options"]
                if isinstance(opts, list):
                    # Extract text from options regardless of their structure
                    translation_fields["options"] = [
                        o.get('text', '') if isinstance(o, dict) else str(o) 
                        for o in opts if o
                    ]
                    print(f"DEBUG EXPLICIT: Found {len(translation_fields['options'])} options in raw form data")
        except Exception as e:
            print(f"Error parsing raw activity_data for translation: {e}")

        # Final sanity check to avoid sending empty lists to AI
        if "options" in translation_fields and not translation_fields["options"]:
            del translation_fields["options"]

        background_tasks.add_task(
            auto_translate_background, 
            SessionLocal, 
            Activity, 
            new_activity.id, 
            translation_fields
        )
    
    return new_activity

@router.put("/{activity_id}", response_model=ActivityResponse)
async def update_activity(
    activity_id: int,
    background_tasks: BackgroundTasks,
    title: str = Form(None),
    description: str = Form(None),
    translations: str = Form(None),
    activity_data: str = Form(None),
    type: str = Form(None),
    start_date: str = Form(None),
    end_date: str = Form(None),
    location: str = Form(None),
    price: str = Form(None),
    slug: str = Form(None),
    is_active: bool = Form(None),
    is_finished_acknowledged: bool = Form(None),
    image: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    # Validate overlap if modifying course data or type
    check_type = type if type else activity.type
    check_data = activity_data if activity_data else (json.dumps(activity.activity_data) if activity.activity_data else None)
    
    validate_course_schedule(db, check_data, check_type, exclude_id=activity_id)
    
    if image:
        if activity.image_url:
            delete_file(activity.image_url)
        
        subdir = "gallery/suggestions" if (type or activity.type) == 'sugerencia' else "gallery/activities"
        activity.image_url = save_upload_file(image, subdirectory=subdir)

    if title is not None: activity.title = title
    if description is not None: activity.description = description
    if translations is not None: activity.translations = json.loads(translations) if translations else None
    if activity_data is not None: activity.activity_data = json.loads(activity_data) if activity_data else None
    if type is not None: activity.type = type
    if start_date is not None: activity.start_date = datetime.fromisoformat(start_date) if start_date else None
    if end_date is not None: activity.end_date = datetime.fromisoformat(end_date) if end_date else None
    if location is not None: activity.location = location
    if price is not None: activity.price = price
    if slug is not None: activity.slug = slug
    if is_active is not None: activity.is_active = is_active
    if is_finished_acknowledged is not None: activity.is_finished_acknowledged = is_finished_acknowledged
    
    db.commit()
    db.refresh(activity)

    # Register in Gallery if a NEW image was uploaded
    if image and activity.image_url:
        gallery_item = Gallery(
            url=activity.image_url,
            alt_text=f"Imagen para {activity.title}",
            category="sugerencias" if activity.type == 'sugerencia' else "actividades"
        )
        db.add(gallery_item)
        db.commit()
    
    # Notify RAG system (n8n) with complete entity
    await notify_n8n_content_change(activity.id, "activity", "update", db=db, entity=activity)
    
    # Re-translate if main fields changed and no new translations provided
    if (title or description or activity_data) and not translations:
        # Use RAW activity_data from form to ensure we have the newest edits
        translation_fields = {"title": title or activity.title}
        if description or activity.description:
            translation_fields["description"] = description if description is not None else activity.description
            
        try:
            # Parse raw JSON from form
            raw_ad = json.loads(activity_data) if activity_data else activity.activity_data
            if isinstance(raw_ad, dict) and "options" in raw_ad:
                opts = raw_ad["options"]
                if isinstance(opts, list):
                    translation_fields["options"] = [
                        o.get('text', '') if isinstance(o, dict) else str(o) 
                        for o in opts if o
                    ]
                    print(f"DEBUG EXPLICIT UPDATE: Found {len(translation_fields['options'])} options")
        except Exception as e:
            print(f"Error parsing activity_data for update translation: {e}")

        if "options" in translation_fields and not translation_fields["options"]:
            del translation_fields["options"]
        
        background_tasks.add_task(
            auto_translate_background, 
            SessionLocal, 
            Activity, 
            activity.id, 
            translation_fields
        )

    return activity

@router.post("/{activity_id}/acknowledge-finish")
async def acknowledge_activity_finish(
    activity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    if activity.image_url:
        delete_file(activity.image_url)
    
    # Notify RAG system BEFORE deleting
    await notify_n8n_content_change(activity_id, "activity", "delete", db=db, entity=activity)
    
    db.delete(activity)
    db.commit()
    
    return {"message": "Activity deleted after acknowledgement"}

@router.delete("/{activity_id}")
async def delete_activity(
    activity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    if activity.image_url:
        delete_file(activity.image_url)

    # Notify RAG system BEFORE deleting
    await notify_n8n_content_change(activity_id, "activity", "delete", db=db, entity=activity)
    
    # Log to dashboard activity
    activity_log = DashboardActivity(
        type='activity',
        action='deleted',
        title=activity.title,
        entity_id=activity_id
    )
    db.add(activity_log)

    db.delete(activity)
    db.commit()
    
    return {"message": "Activity deleted successfully"}
