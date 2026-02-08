from app.core.database import SessionLocal
from app.models.models import Tag

db = SessionLocal()
print("--- Checking Last 10 Tags ---")
tags = db.query(Tag).order_by(Tag.id.desc()).limit(10).all()
for t in tags:
    print(f"ID: {t.id} | Name: {t.name} | Cat: {t.category} | Trans: {t.translations}")
