
from app.core.database import SessionLocal
from app.models.models import Tag, Content, content_tags

db = SessionLocal()

print("--- TAGS IN DB ---")
tags = db.query(Tag).all()
for t in tags:
    print(f"ID: {t.id} | Name: {t.name} | Used in: {len(t.contents)} contents")

print("\n--- CONTENTS WITH TAGS ---")
contents = db.query(Content).all()
for c in contents:
    # Check relationship
    print(f"Content ID: {c.id} | Title: {c.title} | Tags (Relationship): {[t.name for t in c.tag_entities]} | Tags (JSON): {c.tags}")

db.close()
