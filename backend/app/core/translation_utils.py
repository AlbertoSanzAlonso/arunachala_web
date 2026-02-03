import os
import json
from openai import OpenAI
from typing import Dict, List, Any

from dotenv import load_dotenv
load_dotenv()

# Initialize OpenAI client
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

async def translate_content(text_dict: Dict[str, str], target_languages: List[str] = ["ca", "en"]) -> Dict[str, Any]:
    """
    Translates a dictionary of fields into target languages using OpenAI.
    Example input: {'name': 'Clase de Yoga', 'description': 'Relajación total'}
    Example output: {
        'ca': {'name': 'Classe de Ioga', 'description': 'Relaxació total'},
        'en': {'name': 'Yoga Class', 'description': 'Total relaxation'}
    }
    """
    if not client:
        print("Warning: OpenAI client not initialized for translation")
        return {}

    try:
        # Prepare the prompt
        fields_str = json.dumps(text_dict, ensure_ascii=False)
        languages_str = ", ".join(target_languages)
        
        system_prompt = f"""Eres un traductor profesional experto en bienestar, Yoga y salud.
Tu tarea es traducir el siguiente objeto JSON a los siguientes idiomas: {languages_str}.
El idioma original suele ser el español.
Debes devolver ÚNICAMENTE un objeto JSON donde las claves raíz sean los códigos de idioma ({languages_str}) y el valor sea el objeto original traducido conservando las mismas claves.

Ejemplo de salida esperada:
{{
  "ca": {{ "field1": "traducción", ... }},
  "en": {{ "field1": "translation", ... }}
}}"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": fields_str}
            ],
            response_format={"type": "json_object"},
            temperature=0.3
        )

        result = json.loads(response.choices[0].message.content)
        return result
    except Exception as e:
        print(f"Error in automatic translation: {e}")
        return {}

def update_record_translations(db_session, model_class, record_id, translations):
    """Updates a record with new translations in the database."""
    try:
        record = db_session.query(model_class).filter(model_class.id == record_id).first()
        if record:
            # Merging existing translations if any
            current = record.translations or {}
            current.update(translations)
            record.translations = current
            
            # Using flag_modified if SQLAlchemy doesn't detect JSON change
            from sqlalchemy.orm.attributes import flag_modified
            flag_modified(record, "translations")
            
            db_session.commit()
            print(f"Successfully updated translations for {model_class.__name__} ID {record_id}")
            
            # Re-notify n8n so RAG gets the translated version (optional but recommended)
            import asyncio
            from app.core.webhooks import notify_n8n_content_change
            # Since this is likely running in a background task, we can call it
            # But notify_n8n_content_change is async, so we might need to handle the loop correctly
            # depending on where this is called from.
            
    except Exception as e:
        print(f"Error updating database with translations: {e}")
        db_session.rollback()

async def auto_translate_background(db_factory, model_class, record_id, fields_to_translate):
    """Background task to handle translation and DB update."""
    print(f"Starting auto-translation for {model_class.__name__} ID {record_id}...")
    translations = await translate_content(fields_to_translate)
    if translations:
        print(f"Translations received for ID {record_id}: {list(translations.keys())}")
        # We need a fresh session in the background
        db = db_factory()
        try:
            update_record_translations(db, model_class, record_id, translations)
            print(f"Database updated for ID {record_id}")
            
            # Trigger RAG sync again to include translations
            from app.core.webhooks import notify_n8n_content_change
            item_type_map = {
                "YogaClassDefinition": "yoga_class",
                "MassageType": "massage",
                "TherapyType": "therapy",
                "Activity": "activity",
                "Content": "content"
            }
            item_type = item_type_map.get(model_class.__name__, "unknown")
            print(f"Triggering RAG update for {item_type} {record_id}")
            await notify_n8n_content_change(record_id, item_type, "update")
        except Exception as e:
            print(f"Error in background update: {e}")
        finally:
            db.close()
    else:
        print(f"No translations generated for ID {record_id}")
