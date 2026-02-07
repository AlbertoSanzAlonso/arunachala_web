
import requests
import json
import time

API_URL = "http://localhost:8000/api"

def test_full_flow():
    print("--- TESTING FULL MEDITATION + TAG TRANSLATION FLOW ---")
    
    # 1. Create a meditation with a NEW tag
    # Using a tag name that clearly needs translation
    meditation_data = {
        "title": "Prueba de Mente en Calma",
        "type": "meditation",
        "body": "Esta es una meditación de prueba para verificar las traducciones automáticas.",
        "excerpt": "Una breve descripción de paz.",
        "status": "published",
        "tags": ["Paz Profunda", "Mente Clara"]
    }
    
    print(f"1. Creating meditation with tags: {meditation_data['tags']}...")
    try:
        res = requests.post(f"{API_URL}/content", json=meditation_data)
        if res.status_code != 200:
            print(f"❌ Failed to create meditation: {res.text}")
            return
        
        meditation = res.json()
        meditation_id = meditation['id']
        print(f"✅ Meditation created with ID: {meditation_id}")
        
        # 2. Wait for background tasks to finish (OpenAI + DB Updates)
        print("2. Waiting 10 seconds for AI translations to complete...")
        time.sleep(10)
        
        # 3. Check the Tag table for the brand new tags
        print("3. Verifying Tag table translations...")
        res_tags = requests.get(f"{API_URL}/tags?category=meditation")
        all_tags = res_tags.json()
        
        for tag_name in ["Paz profunda", "Mente clara"]: # sync_content_tags capitalizes first letter
            found_tag = next((t for t in all_tags if t['name'] == tag_name), None)
            if found_tag:
                print(f"📍 Tag '{tag_name}' found.")
                print(f"   Translations: {json.dumps(found_tag.get('translations'), indent=2)}")
            else:
                print(f"❌ Tag '{tag_name}' NOT found in Tag table.")

        # 4. Check the Meditation itself to see if its translations[lang].tags are populated
        print("4. Verifying Meditation record translations...")
        res_med = requests.get(f"{API_URL}/content/{meditation_id}")
        updated_med = res_med.json()
        
        translations = updated_med.get('translations')
        if translations:
            for lang in ['en', 'ca']:
                if lang in translations and 'tags' in translations[lang]:
                    print(f"✅ {lang.upper()} tags: {translations[lang]['tags']}")
                else:
                    print(f"❌ {lang.upper()} tags missing in meditation record.")
        else:
            print("❌ No translations found in meditation record.")

    except Exception as e:
        print(f"Error during flow: {e}")

if __name__ == "__main__":
    test_full_flow()
