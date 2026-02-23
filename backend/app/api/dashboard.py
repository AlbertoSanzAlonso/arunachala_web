from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.core.database import get_db
from app.models.models import (
    Content, Gallery, YogaClassDefinition, Activity, 
    ClassSchedule, MassageType, TherapyType, User, DashboardActivity
)
from app.api.auth import get_current_user
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

class RecentActivityItem(BaseModel):
    id: Optional[int] = None
    type: str  # 'content', 'gallery', 'yoga_class', 'activity', etc.
    action: str  # 'created', 'updated', 'deleted'
    title: str
    timestamp: datetime

    class Config:
        from_attributes = True

@router.get("/recent-activity", response_model=List[RecentActivityItem])
def get_recent_activity(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get recent activity from all tables"""
    activities = []
    seen_entities = set() # (type, entity_id, action)

    # Helper function to avoid duplicates
    def add_activity(entity_id, type_name, action, title, timestamp):
        if not timestamp:
            return
        if (type_name, entity_id, action) not in seen_entities:
            activities.append({
                'id': entity_id,
                'type': type_name,
                'action': action,
                'title': title,
                'timestamp': timestamp
            })
            if entity_id is not None:
                seen_entities.add((type_name, entity_id, action))

    # 1. Activities logged in DashboardActivity table
    persistent_activities = db.query(DashboardActivity).order_by(desc(DashboardActivity.timestamp)).limit(limit).all()
    for item in persistent_activities:
        title = item.title
        if item.action == 'created' and not title.startswith(('Nuevo', 'Nueva')):
            title = f"Nuevo: {title}"
        elif item.action == 'deleted' and not title.endswith('(Eliminado)') and not 'eliminada' in title.lower():
            title = f"{title} (Eliminado)"
            
        add_activity(item.entity_id or item.id, item.type, item.action, title, item.timestamp)

    # 2. Add Content
    contents = db.query(Content).order_by(desc(func.coalesce(Content.updated_at, Content.created_at))).limit(limit).all()
    for content in contents:
        type_label = {'article': 'Artículo', 'meditation': 'Meditación', 'mantra': 'Mantra', 'service': 'Servicio', 'announcement': 'Anuncio'}.get(content.type, 'Contenido')
        prefix = "Nueva" if content.type == 'meditation' else "Nuevo"
        if content.updated_at and content.updated_at != content.created_at:
            add_activity(content.id, 'content', 'updated', f"{type_label} actualizado: {content.title}", content.updated_at)
        add_activity(content.id, 'content', 'created', f"{prefix} {type_label}: {content.title}", content.created_at)

    # 3. Add Gallery
    gallery_items = db.query(Gallery).order_by(desc(Gallery.created_at)).limit(limit).all()
    for item in gallery_items:
        add_activity(item.id, 'gallery', 'created', f"Nueva imagen de galería ({item.category or 'general'})", item.created_at)

    # 4. Add Yoga Classes
    yoga_classes = db.query(YogaClassDefinition).order_by(desc(YogaClassDefinition.created_at)).limit(limit).all()
    for yc in yoga_classes:
        add_activity(yc.id, 'yoga_class', 'created', f"Nueva clase de yoga: {yc.name}", yc.created_at)

    # 5. Add Schedules
    schedules = db.query(ClassSchedule).order_by(desc(func.coalesce(ClassSchedule.updated_at, ClassSchedule.created_at))).limit(limit).all()
    for s in schedules:
        c_name = s.yoga_class.name if s.yoga_class else s.class_name or "Clase"
        if s.updated_at and s.updated_at != s.created_at:
            add_activity(s.id, 'schedule', 'updated', f"Horario actualizado: {c_name} - {s.day_of_week} {s.start_time}", s.updated_at)
        add_activity(s.id, 'schedule', 'created', f"Nuevo horario: {c_name} - {s.day_of_week} {s.start_time}", s.created_at)

    # 6. Add Massage Types
    massages = db.query(MassageType).order_by(desc(MassageType.created_at)).limit(limit).all()
    for m in massages:
        add_activity(m.id, 'massage', 'created', f"Nuevo masaje: {m.name}", m.created_at)

    # 7. Add Therapies
    therapies = db.query(TherapyType).order_by(desc(TherapyType.created_at)).limit(limit).all()
    for t in therapies:
        add_activity(t.id, 'therapy', 'created', f"Nueva terapia: {t.name}", t.created_at)

    # 8. Add Activities
    activity_items = db.query(Activity).order_by(desc(func.coalesce(Activity.updated_at, Activity.created_at))).limit(limit).all()
    for a in activity_items:
        t_label_lower = {'sugerencia': 'sugerencia', 'curso': 'curso', 'taller': 'taller', 'evento': 'evento', 'retiro': 'retiro'}.get(a.type, 'actividad')
        t_label_upper = t_label_lower.capitalize()
        pr = "Nueva" if a.type in ['sugerencia', 'actividad'] else "Nuevo"
        
        if a.updated_at and a.updated_at != a.created_at:
            add_activity(a.id, 'activity', 'updated', f"{t_label_upper} actualizado/a: {a.title}", a.updated_at)
        add_activity(a.id, 'activity', 'created', f"{pr} {t_label_lower}: {a.title}", a.created_at)

    # 9. Add Users
    users = db.query(User).order_by(desc(func.coalesce(User.updated_at, User.created_at))).limit(limit).all()
    for u in users:
        if u.updated_at and u.updated_at != u.created_at:
            add_activity(u.id, 'user', 'updated', f"Usuario actualizado: {u.email}", u.updated_at)
        add_activity(u.id, 'user', 'created', f"Nuevo usuario: {u.email}", u.created_at)

    # Sort all by timestamp descending and slice
    activities.sort(key=lambda x: x['timestamp'], reverse=True)
    return activities[:limit]

@router.get("/stats")
def get_site_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get counts of various entities for the dashboard"""
    return {
        "articles": db.query(Content).filter(Content.type == 'article').count(),
        "meditations": db.query(Content).filter(Content.type == 'meditation').count(),
        "images": db.query(Gallery).count(),
        "activities": db.query(Activity).count(),
        "yoga_classes": db.query(YogaClassDefinition).count(),
        "users": db.query(User).count()
    }
