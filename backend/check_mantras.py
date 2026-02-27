from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.models import Mantra, Personalization

engine = create_engine("postgresql://postgres:ArunachalaSupabase2026!@db.vybpihtssncjalbsnbcr.supabase.co:5432/postgres")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

config = db.query(Personalization).filter(Personalization.key == "daily_mantra_id").first()
print("Current Mantra ID in DB:", config.value if config else "None")
active_mantras = db.query(Mantra).filter(Mantra.is_active == True).all()
print(f"Total Active Mantras: {len(active_mantras)}")
for m in active_mantras:
    print(f"- id={m.id}, text={m.text_sanskrit}")
