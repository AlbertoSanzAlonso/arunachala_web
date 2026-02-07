
from app.core.database import engine, Base
from app.models.models import Tag, content_tags

def recreate_tags():
    print("Dropping content_tags and tags tables...")
    try:
        content_tags.drop(engine)
        Tag.__table__.drop(engine)
    except Exception as e:
        print(f"Warning dropping: {e}")
        
    print("Creating new tables...")
    Base.metadata.create_all(bind=engine)
    print("Tags system recreated with category support.")

if __name__ == "__main__":
    recreate_tags()
