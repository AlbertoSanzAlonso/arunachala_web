import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.core.database import SessionLocal
from app.models.models import Promotion

db = SessionLocal()
promos = db.query(Promotion).order_by(Promotion.id.desc()).limit(5).all()
for p in promos:
    print(f"ID: {p.id}")
    print(f"Title: {p.title}")
    print(f"Translations: {p.translations}")
    print("---")
