from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, union_all, select, literal
from app.core.database import get_db
from app.models.models import (
    Content, Gallery, YogaClassDefinition, Activity, 
    ClassSchedule, MassageType, TherapyType, User
)
from app.api.auth import get_current_user
from typing import List
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

class RecentActivityItem(BaseModel):
    id: int
    type: str  # 'content', 'gallery', 'yoga_class', 'activity', etc.
    action: str  # 'created', 'updated'
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
    
    # Get recent persistent activities (including deletions)
    from app.models.models import DashboardActivity
    persistent_activities = db.query(DashboardActivity).order_by(desc(DashboardActivity.timestamp)).limit(limit).all()
    for item in persistent_activities:
        title = item.title
        if item.action == 'created' and not title.startswith(('Nuevo', 'Nueva')):
            # Guess gender for persistent activities if needed, or just use neutral
            title = f"Nuevo: {title}"
        elif item.action == 'deleted':
            title = f"{title} (Eliminado)"
            
        if item.entity_id:
            seen_entities.add((item.type, item.entity_id, item.action))
            
        activities.append({
            'id': item.entity_id or item.id,
            'type': item.type,
            'action': item.action,
            'title': title,
            'timestamp': item.timestamp
        })

    # Get recent content (created and updated)
    contents = db.query(Content).order_by(desc(Content.created_at)).limit(limit).all()
    for content in contents:
        if ('content', content.id, 'created') in seen_entities:
            continue
        # Check if already logged to avoid duplicates if we start logging everything
        # For now, simple deduplication or assume we only log deletes there for now
        
        type_label = {
            'article': 'Artículo',
            'meditation': 'Meditación',
            'mantra': 'Mantra',
            'service': 'Servicio',
            'announcement': 'Anuncio'
        }.get(content.type, 'Contenido')
        
        prefix = "Nueva" if content.type == 'meditation' else "Nuevo"
        activities.append({
            'id': content.id,
            'type': 'content',
            'action': 'created',
            'title': f"{prefix} {type_label}: {content.title}",
            'timestamp': content.created_at
        })
        
        # Add update event if updated_at exists and is different from created_at
        if content.updated_at and content.updated_at != content.created_at:
            activities.append({
                'id': content.id,
                'type': 'content',
                'action': 'updated',
                'title': f"{type_label} actualizado: {content.title}",
                'timestamp': content.updated_at
            })
    
    # Get recent gallery images
    gallery_items = db.query(Gallery).order_by(desc(Gallery.created_at)).limit(limit).all()
    for item in gallery_items:
        if ('gallery', item.id, 'created') in seen_entities:
            continue
        activities.append({
            'id': item.id,
            'type': 'gallery',
            'action': 'created',
            'title': f"Nueva imagen de galería ({item.category or 'general'})",
            'timestamp': item.created_at
        })
    
    # Get recent yoga classes
    yoga_classes = db.query(YogaClassDefinition).order_by(desc(YogaClassDefinition.created_at)).limit(limit).all()
    for yoga_class in yoga_classes:
        if ('yoga_class', yoga_class.id, 'created') in seen_entities:
            continue
        activities.append({
            'id': yoga_class.id,
            'type': 'yoga_class',
            'action': 'created',
            'title': f"Nueva clase de yoga: {yoga_class.name}",
            'timestamp': yoga_class.created_at
        })
    
    # Get recent schedules
    schedules = db.query(ClassSchedule).order_by(desc(ClassSchedule.created_at)).limit(limit).all()
    for schedule in schedules:
        if ('schedule', schedule.id, 'created') in seen_entities:
            continue
        class_name = schedule.yoga_class.name if schedule.yoga_class else schedule.class_name or "Clase"
        activities.append({
            'id': schedule.id,
            'type': 'schedule',
            'action': 'created',
            'title': f"Nuevo horario: {class_name} - {schedule.day_of_week} {schedule.start_time}",
            'timestamp': schedule.created_at
        })
        
        # Add update event if updated_at exists and is different
        if schedule.updated_at and schedule.updated_at != schedule.created_at:
            activities.append({
                'id': schedule.id,
                'type': 'schedule',
                'action': 'updated',
                'title': f"Horario actualizado: {class_name} - {schedule.day_of_week} {schedule.start_time}",
                'timestamp': schedule.updated_at
            })
    
    # Get recent massage types
    massages = db.query(MassageType).order_by(desc(MassageType.created_at)).limit(limit).all()
    for massage in massages:
        if ('massage', massage.id, 'created') in seen_entities:
            continue
        
        activities.append({
            'id': massage.id,
            'type': 'massage',
            'action': 'created',
            'title': f"Nuevo masaje: {massage.name}",
            'timestamp': massage.created_at
        })
    
    # Get recent therapy types
    therapies = db.query(TherapyType).order_by(desc(TherapyType.created_at)).limit(limit).all()
    for therapy in therapies:
        if ('therapy', therapy.id, 'created') in seen_entities:
            continue
        
        activities.append({
            'id': therapy.id,
            'type': 'therapy',
            'action': 'created',
            'title': f"Nueva terapia: {therapy.name}",
            'timestamp': therapy.created_at
        })
    
    # Get recent activities/events
    activity_items = db.query(Activity).order_by(desc(Activity.created_at)).limit(limit).all()
    for activity in activity_items:
        if ('activity', activity.id, 'created') in seen_entities:
            continue
        
        type_labels = {
            'sugerencia': 'sugerencia',
            'curso': 'curso',
            'taller': 'taller',
            'evento': 'evento',
            'retiro': 'retiro'
        }
        label = type_labels.get(activity.type, 'actividad')
        prefix = "Nueva" if activity.type in ['sugerencia', 'actividad'] else "Nuevo"
        
        activities.append({
            'id': activity.id,
            'type': 'activity',
            'action': 'created',
            'title': f"{prefix} {label}: {activity.title}",
            'timestamp': activity.created_at
        })
        
        # Add update event if updated_at exists and is different
        if activity.updated_at and activity.updated_at != activity.created_at:
            type_labels = {
                'sugerencia': 'Sugerencia',
                'curso': 'Curso',
                'taller': 'Taller',
                'evento': 'Evento',
                'retiro': 'Retiro'
            }
            label = type_labels.get(activity.type, 'Actividad')
            activities.append({
                'id': activity.id,
                'type': 'activity',
                'action': 'updated',
                'title': f"{label} actualizado/a: {activity.title}",
                'timestamp': activity.updated_at
            })
    
    # Get recent users
    users = db.query(User).order_by(desc(User.created_at)).limit(limit).all()
    for user in users:
        activities.append({
            'id': user.id,
            'type': 'user',
            'action': 'created',
            'title': f"Nuevo usuario: {user.email}",
            'timestamp': user.created_at
        })
        
        # Add update event if updated_at exists and is different
        if user.updated_at and user.updated_at != user.created_at:
            activities.append({
                'id': user.id,
                'type': 'user',
                'action': 'updated',
                'title': f"Usuario actualizado: {user.email}",
                'timestamp': user.updated_at
            })
    
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

# Sort all activities by timestamp and return top N
    activities.sort(key=lambda x: x['timestamp'], reverse=True)
    
    return activities[:limit]
