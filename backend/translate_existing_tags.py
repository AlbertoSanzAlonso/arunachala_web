
import asyncio
import os
import sys

# Ensure correct path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.models import Tag
from app.core.translation_utils import auto_translate_background

async def translate_all_tags():
    print("--- TRANSLATING EXISTING TAGS ---")
    db = SessionLocal()
    try:
        tags = db.query(Tag).all()
        print(f"Total tags in database: {len(tags)}")
        
        count = 0
        for tag in tags:
            # Check if cat or en translation is missing
            has_ca = tag.translations and "ca" in tag.translations and "name" in tag.translations["ca"]
            has_en = tag.translations and "en" in tag.translations and "name" in tag.translations["en"]
            
            if not has_ca or not has_en:
                print(f"Translating: [{tag.category}] {tag.name}")
                # We can call the background task directly but await it
                await auto_translate_background(SessionLocal, Tag, tag.id, {"name": tag.name})
                count += 1
            else:
                print(f"Skipping: {tag.name} (already translated)")
        
        print(f"Finished. Translated {count} tags.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(translate_all_tags())
