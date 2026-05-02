
import os
import json
import logging
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from openai import OpenAI
from app.core.config import settings

logger = logging.getLogger(__name__)

def translate_object_fields(fields: Dict[str, str], target_lang: str) -> Dict[str, str]:
    """
    Translates a dictionary of fields into a target language using OpenAI.
    Returns a dictionary with the same keys and translated values.
    """
    if not settings.OPENAI_API_KEY:
        logger.error("OPENAI_API_KEY not set")
        return {}

    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    
    # Identify which language we are translating to
    lang_names = {
        "ca": "Catalan",
        "en": "English",
        "es": "Spanish"
    }
    lang_name = lang_names.get(target_lang, target_lang)

    system_prompt = f"""You are a professional translator for a Yoga and Holistic Therapy center named 'Arunachala'.
Translate the following content into {lang_name}.
- Maintain a calm, professional, and welcoming tone.
- Keep HTML tags (like <p>, <strong>, etc.) exactly as they are.
- Keep markdown formatting.
- Return ONLY a JSON object with the same keys as the input.
- Do not add any explanations or notes.
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(fields, ensure_ascii=False)}
            ],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
    except Exception as e:
        logger.error(f"Error calling OpenAI for translation: {e}")
        return {}

async def update_record_translations(db: Session, model_class, record_id: int, translations: Dict[str, Any]):
    """
    Helper to update the translations JSON field in the database.
    """
    try:
        record = db.query(model_class).filter(model_class.id == record_id).first()
        if record:
            current = record.translations or {}
            if isinstance(current, str):
                try: current = json.loads(current)
                except: current = {}

            # Merge new translations (skipping 'es' if present as it's the source)
            for lang, content in translations.items():
                if lang == "es": continue
                if lang not in current:
                    current[lang] = {}
                if isinstance(content, dict):
                    for key, val in content.items():
                        if val is not None:
                            current[lang][key] = val
            
            # Clean up any 'es' entry that might have slipped in
            if "es" in current:
                del current["es"]
            
            record.translations = dict(current)
            flag_modified(record, "translations")
            db.commit()
            print(f"✅ Successfully updated translations for {model_class.__name__} ID {record_id}")
            
    except Exception as e:
        print(f"❌ Error updating database with translations for {model_class.__name__} ID {record_id}: {e}")
        db.rollback()

async def auto_translate_background(db_factory, model_class, record_id, fields_to_translate):
    """
    Background task to handle translation, DB update, and RAG sync.
    """
    print(f"--- Starting Background Translation for {model_class.__name__} ID {record_id} ---")
    
    # 1. Log Input
    try:
        with open("translation_debug.log", "a") as f:
            f.write(f"\n[{record_id}] New Translation Request: {json.dumps(fields_to_translate, ensure_ascii=False)}\n")
    except: pass

    db = db_factory()
    try:
        # Re-fetch record
        record = db.query(model_class).filter(model_class.id == record_id).first()
        if not record:
            print(f"Record {record_id} not found.")
            return

        target_langs = ["ca", "en"]
        all_new_translations = {}

        for lang in target_langs:
            # Clear stale data for this language before requesting new one
            clear_stale_translated_fields(record, lang, list(fields_to_translate.keys()))
            db.commit()
            db.refresh(record)

            # Request translation
            print(f"Requesting OpenAI {lang.upper()}...")
            translated = translate_object_fields(fields_to_translate, lang)
            if translated:
                all_new_translations[lang] = translated
                print(f"Received {lang.upper()} response.")
            else:
                print(f"Failed to get {lang.upper()} response.")

        if all_new_translations:
            # Update DB using the helper
            await update_record_translations(db, model_class, record_id, all_new_translations)
            
            # 2. Log Success
            try:
                with open("translation_debug.log", "a") as f:
                    f.write(f"[{record_id}] Success: {list(all_new_translations.keys())}\n")
            except: pass

            # 3. Trigger RAG sync (n8n)
            from app.core.webhooks import notify_n8n_content_change
            item_type_map = {
                "YogaClassDefinition": "yoga_class",
                "MassageType": "massage",
                "TherapyType": "therapy",
                "Activity": "activity",
                "Content": "content"
            }
            item_type = item_type_map.get(model_class.__name__, "unknown")
            if item_type != "unknown":
                print(f"Notifying n8n for RAG update...")
                await notify_n8n_content_change(record_id, item_type, "update")

    except Exception as e:
        print(f"CRITICAL ERROR in background task: {e}")
        try:
            with open("translation_debug.log", "a") as f:
                f.write(f"[{record_id}] CRITICAL ERROR: {str(e)}\n")
        except: pass
    finally:
        db.close()

def clear_stale_translated_fields(record, lang_code: str, fields: List[str]):
    """
    Clears specific fields within a language's translation object.
    """
    if not record.translations or lang_code not in record.translations:
        return

    try:
        current = dict(record.translations)
        lang_trans = dict(current.get(lang_code, {}))
        
        changed = False
        for field in fields:
            if field in lang_trans:
                del lang_trans[field]
                changed = True
        
        if changed:
            current[lang_code] = lang_trans
            record.translations = current
            flag_modified(record, "translations")
            print(f"Cleared stale {lang_code} fields for ID {record.id}")
    except Exception as e:
        print(f"Error clearing stale fields: {e}")

def is_translations_empty(translations) -> bool:
    """
    Check if translations JSON is empty or missing key languages.
    """
    if not translations:
        return True
    
    if isinstance(translations, str):
        try:
            translations = json.loads(translations)
        except:
            return True
            
    if not isinstance(translations, dict):
        return True
        
    # Check if we have at least one translation for main languages
    return not any(lang in translations for lang in ["ca", "en"])
