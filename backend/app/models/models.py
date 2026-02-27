from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Text, Enum, JSON, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    profile_picture = Column(String, nullable=True)
    role = Column(String, default="user")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class ContentType(str, enum.Enum):
    ARTICLE = "article"
    MANTRA = "mantra"
    SERVICE = "service"
    ANNOUNCEMENT = "announcement"
    MEDITATION = "meditation"

class ContentStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

# Association table for Content <-> Tags
content_tags = Table('content_tags', Base.metadata,
    Column('content_id', Integer, ForeignKey('contents.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id'), primary_key=True)
)

class Tag(Base):
    __tablename__ = 'tags'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False) # Removed unique here to allow same name in diff categories
    category = Column(String, index=True, nullable=True) # 'meditation', 'article', etc.
    translations = Column(JSON, nullable=True) # {"en": "Peace", "ca": "Pau"}

    # Relationship back to content
    contents = relationship("Content", secondary=content_tags, back_populates="tag_entities")

class Content(Base):
    __tablename__ = "contents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    slug = Column(String, unique=True, index=True)
    body = Column(Text, nullable=True)
    excerpt = Column(String, nullable=True)  # Short description for listing
    type = Column(String, nullable=False)  # ContentType
    category = Column(String, nullable=True)  # 'yoga', 'therapy', 'general'
    status = Column(String, default=ContentStatus.DRAFT)
    author_id = Column(Integer, ForeignKey("users.id"))
    thumbnail_url = Column(String, nullable=True)
    media_url = Column(String, nullable=True)
    seo_title = Column(String, nullable=True)
    seo_description = Column(String, nullable=True)
    tags = Column(JSON, nullable=True)  # Array of tags
    translations = Column(JSON, nullable=True)
    # Content stats
    view_count = Column(Integer, default=0)
    play_time_seconds = Column(Integer, default=0)
    
    # RAG sync fields
    vector_id = Column(String, nullable=True)
    vectorized_at = Column(DateTime(timezone=True), nullable=True)
    needs_reindex = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    author = relationship("User", back_populates="contents")
    tag_entities = relationship("Tag", secondary=content_tags, back_populates="contents")

User.contents = relationship("Content", back_populates="author")

class Gallery(Base):
    __tablename__ = "gallery"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    alt_text = Column(String, nullable=True)
    category = Column(String, nullable=True) # e.g., 'studio', 'retreat', 'class'
    position = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class YogaClassDefinition(Base):
    __tablename__ = "yoga_classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    translations = Column(JSON, nullable=True) # { "ca": { "name": "...", "description": "..." }, "en": {...} }
    color = Column(String, nullable=True) # Tailwind class like 'bg-forest/20'
    age_range = Column(String, nullable=True) # Optional note or age
    # RAG sync fields
    vector_id = Column(String, nullable=True)
    vectorized_at = Column(DateTime(timezone=True), nullable=True)
    needs_reindex = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    schedules = relationship("ClassSchedule", back_populates="yoga_class")

class ClassSchedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("yoga_classes.id"), nullable=True)
    class_name = Column(String, nullable=True) # Keeping for backwards compatibility/migration
    day_of_week = Column(String, nullable=False) # Monday, Tuesday...
    start_time = Column(String, nullable=False) # "09:00"
    end_time = Column(String, nullable=False) # "10:30"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    yoga_class = relationship("YogaClassDefinition", back_populates="schedules")



class MassageType(Base):
    __tablename__ = "massage_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    excerpt = Column(String, nullable=True) # Short description for thumbnail
    description = Column(Text, nullable=True) # Full description
    benefits = Column(Text, nullable=True) # Benefits list/text
    translations = Column(JSON, nullable=True)
    duration_min = Column(Integer, nullable=True)
    image_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    price = Column(String, nullable=True) 
    # RAG sync fields
    vector_id = Column(String, nullable=True)
    vectorized_at = Column(DateTime(timezone=True), nullable=True)
    needs_reindex = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TherapyType(Base):
    __tablename__ = "therapy_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    excerpt = Column(String, nullable=True) # Short description for thumbnail
    description = Column(Text, nullable=True) # Full description
    benefits = Column(Text, nullable=True) # Benefits list/text
    translations = Column(JSON, nullable=True)
    duration_min = Column(Integer, nullable=True)
    price = Column(String, nullable=True) 
    image_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    # RAG sync fields
    vector_id = Column(String, nullable=True)
    vectorized_at = Column(DateTime(timezone=True), nullable=True)
    needs_reindex = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AgentConfig(Base):
    __tablename__ = "agent_config"

    id = Column(Integer, primary_key=True, index=True)
    tone = Column(String, default="Asistente Amable")
    response_length = Column(String, default="balanced") # concise, balanced, detailed
    emoji_style = Column(String, default="moderate") # none, moderate, high
    focus_area = Column(String, default="info") # info, booking, coaching
    system_instructions = Column(Text, nullable=True)
    quiz_model = Column(String, default="groq") # openai, groq, gemini
    chatbot_model = Column(String, default="openai") # openai, groq, gemini
    is_active = Column(Boolean, default=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    translations = Column(JSON, nullable=True)
    type = Column(String, nullable=False) # 'curso', 'taller', 'evento', 'retiro'
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    location = Column(String, nullable=True) 
    price = Column(String, nullable=True) 
    image_url = Column(String, nullable=True)
    activity_data = Column(JSON, nullable=True)
    slug = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=True)
    is_finished_acknowledged = Column(Boolean, default=False)
    # RAG sync fields
    vector_id = Column(String, nullable=True)
    vectorized_at = Column(DateTime(timezone=True), nullable=True)
    needs_reindex = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    suggestions = relationship("Suggestion", back_populates="activity", cascade="all, delete-orphan")



class AutomationTask(Base):
    __tablename__ = "automation_tasks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False) # e.g., "Generar artículo de Yoga"
    task_type = Column(String, nullable=False) # e.g., "generate_article"
    category = Column(String, nullable=True) # "yoga", "therapy"
    schedule_type = Column(String, default="weekly") # "daily", "weekly"
    schedule_days = Column(String, nullable=True) # "1,3,5" (Mon, Wed, Fri)
    schedule_time = Column(String, default="09:00")
    is_active = Column(Boolean, default=False)
    last_run = Column(DateTime(timezone=True), nullable=True)
    next_run = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class DashboardActivity(Base):
    __tablename__ = "dashboard_activities"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False) # 'content', 'gallery', etc.
    action = Column(String, nullable=False) # 'created', 'updated', 'deleted'
    title = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    entity_id = Column(Integer, nullable=True) # ID of the related entity

class RAGSyncLog(Base):
    """Tracks RAG synchronization operations for all vectorized content"""
    __tablename__ = "rag_sync_log"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String, nullable=False)  # 'yoga_class', 'massage', 'therapy', 'content', 'activity'
    entity_id = Column(Integer, nullable=False)
    action = Column(String, nullable=False)  # 'create', 'update', 'delete'
    vector_id = Column(String, nullable=True)  # ID in Qdrant
    status = Column(String, nullable=False, default='pending')  # 'pending', 'processing', 'success', 'failed'
    error_message = Column(Text, nullable=True)
    webhook_sent_at = Column(DateTime(timezone=True), nullable=True)
    vectorized_at = Column(DateTime(timezone=True), nullable=True)
    sync_metadata = Column(JSON, nullable=True)  # Additional info (model used, language, etc.)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Suggestion(Base):
    __tablename__ = "suggestions"

    id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=True) # Link to the specific poll activity
    activity_type = Column(String, nullable=True) # Selected option text
    custom_suggestion = Column(String, nullable=True) # User's own suggestion
    comments = Column(Text, nullable=True)
    status = Column(String, default="pending") # pending, reviewed, implemented
    ip_address = Column(String, nullable=True) # Track IP to prevent multiple votes
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Optional relationship
    # Relationship
    activity = relationship("Activity", back_populates="suggestions")




class Personalization(Base):
    __tablename__ = "personalization"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False) # e.g., 'logo_url'
    value = Column(Text, nullable=True) # The URL or setting value
    description = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class SiteConfig(Base):
    __tablename__ = "site_config"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False) # e.g., 'about_us_image'
    value = Column(Text, nullable=True) # The URL or setting value
    description = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=True)
    language = Column(String, default='es')
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Promotion(Base):
    __tablename__ = "promotions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True)
    description = Column(Text, nullable=True)
    discount_code = Column(String, nullable=True)
    discount_percentage = Column(Integer, nullable=True)
    image_url = Column(String, nullable=True)
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    translations = Column(JSON, nullable=True)
    # RAG sync fields
    vector_id = Column(String, nullable=True)
    vectorized_at = Column(DateTime(timezone=True), nullable=True)
    needs_reindex = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Mantra(Base):
    __tablename__ = "mantras"
    id = Column(Integer, primary_key=True, index=True)
    text_sanskrit = Column(String, nullable=False)
    translation = Column(String, nullable=False)
    is_predefined = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
