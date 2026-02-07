
from app.core.database import SessionLocal
from app.models.models import Tag

db = SessionLocal()
tags = db.query(Tag).all()
print(f"--- ALL TAGS ({len(tags)}) ---")
for t in tags:
    print(f"ID: {t.id} | Name: {t.name} | Category: {t.category} | Translations: {t.translations}")
db.close()
