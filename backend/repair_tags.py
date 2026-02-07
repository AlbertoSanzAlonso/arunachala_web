
from app.core.database import SessionLocal
from app.models.models import Content, Tag, content_tags
from app.api.content import process_tags, sync_content_tags

def repair_tags():
    db = SessionLocal()
    try:
        contents = db.query(Content).all()
        print(f"Checking {len(contents)} content items...")
        
        for c in contents:
            if c.tags:
                print(f"Repairing content ID {c.id} ({c.type}): {c.tags}")
                # Use the official sync logic to recreate missing tag entities
                sync_content_tags(db, c, c.tags)
        
        db.commit()
        print("Done repairing tags.")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    repair_tags()
