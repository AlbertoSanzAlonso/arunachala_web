
from app.core.database import SessionLocal
from app.api.content import cleanup_orphan_tags
from app.models.models import Tag

def manual_cleanup():
    db = SessionLocal()
    try:
        # Count tags before
        count_before = db.query(Tag).count()
        print(f"Total tags before cleanup: {count_before}")
        
        # Run cleanup
        cleanup_orphan_tags(db)
        
        # Count tags after
        count_after = db.query(Tag).count()
        print(f"Total tags after cleanup: {count_after}")
        print(f"Removed {count_before - count_after} orphan tags.")
        
    except Exception as e:
        print(f"Error during manual cleanup: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    manual_cleanup()
