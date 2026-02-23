import asyncio
import os
from dotenv import load_dotenv
load_dotenv(".env")
from app.core.database import SessionLocal
from app.models.models import Tag
from app.core.translation_utils import auto_translate_background

async def run():
    db = SessionLocal()
    tags = db.query(Tag).all()
    for t in tags:
        # Check if translations is null or effectively empty
        if not t.translations or "en" not in t.translations or "ca" not in t.translations:
            print(f"Translating missing tag: {t.id} - {t.name}...")
            # Run the background function straight here
            # Since auto_translate_background closes its own DB session, let's just await it.
            await auto_translate_background(SessionLocal, Tag, t.id, {"name": t.name})
    db.close()
    print("Done retroactive tag translation")

asyncio.run(run())
