import asyncio
import os
from sqlalchemy.orm.attributes import flag_modified
from app.core.database import SessionLocal
from app.models.models import MassageType, TherapyType, YogaClassDefinition, Activity
from app.core.translation_utils import translate_content

async def translate_all():
    db = SessionLocal()
    models_to_check = [MassageType, TherapyType, YogaClassDefinition, Activity]
    
    print("Iniciando traducción masiva de contenido existente...")
    
    for model in models_to_check:
        items = db.query(model).all()
        for item in items:
            if not item.translations:
                name_attr = 'name' if hasattr(item, 'name') else 'title'
                val = getattr(item, name_attr)
                desc = getattr(item, 'description', '')
                exc = getattr(item, 'excerpt', '')
                benefits = getattr(item, 'benefits', '')
                
                print(f"Traduciendo {model.__name__}: {val}...")
                
                fields = {name_attr: val}
                if desc: fields['description'] = desc
                if exc: fields['excerpt'] = exc
                if benefits: fields['benefits'] = benefits
                
                translations = await translate_content(fields)
                if translations:
                    item.translations = translations
                    flag_modified(item, "translations")
                    db.commit()
                    print(f"✅ Guardado: {val}")
    
    db.close()
    print("¡Proceso de traducción masiva finalizado!")

if __name__ == "__main__":
    asyncio.run(translate_all())
