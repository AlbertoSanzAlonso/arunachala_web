
from app.core.database import engine, Base
from app.models.models import Tag, content_tags, Content

def update_schema():
    print("Creating new tables for Tags...")
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    update_schema()
