
from app.core.database import SessionLocal
from app.models.models import Tag, Content
import json

def test_tag_visibility():
    db = SessionLocal()
    try:
        print("--- TESTING TAG VISIBILITY ---")
        tags = db.query(Tag).all()
        print(f"Total tags in DB: {len(tags)}")
        for t in tags:
            content_count = len(t.contents)
            print(f"ID: {t.id} | Name: {t.name} | Contents linked: {content_count}")
        
        # Test the 'any()' filter
        in_use_tags = db.query(Tag).filter(Tag.contents.any()).all()
        print(f"Tags considered 'in_use' by SQLAlchemy: {[t.name for t in in_use_tags]}")
        
    finally:
        db.close()

if __name__ == "__main__":
    test_tag_visibility()
