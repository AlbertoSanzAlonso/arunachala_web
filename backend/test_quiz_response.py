
import requests
import json
import sys

# Change to the actual backend URL if different
URL = "http://localhost:8000/api/chat"

payload = {
    "messages": [
        {"role": "user", "content": 'Respuestas usuario: {"q1": "Me siento estresado", "q2": "Busco calma", "q3": "Prefiero meditar"}'}
    ],
    "is_quiz": True,
    "stream": False,
    "language": "es"
}

try:
    print(f"Sending request to {URL}...")
    response = requests.post(URL, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        print("\n--- AI Response ---")
        print(data["response"])
        print("\n--- End Response ---")
        
        # Check for bad URLs
        text = data["response"]
        if "http://localhost" in text or "https://localhost" in text:
            print("\n❌ FAILURE: Found absolute localhost URL in response!")
            sys.exit(1)
            
        if "http://" in text or "https://" in text:
             print("\n❌ FAILURE: Found absolute URL (http/https) in response!")
             sys.exit(1)

        # Check for relative URLs in buttons
        import re
        buttons = re.findall(r'\[\[BUTTON:(.*?)\|(.*?)\]\]', text)
        if not buttons:
            print("\n⚠️ WARNING: No buttons found in response.")
        else:
            print(f"\n✅ Found {len(buttons)} buttons:")
            for label, url in buttons:
                print(f"  - Label: '{label}', URL: '{url}'")
                if not url.startswith("/"):
                     print(f"    ❌ ERROR: URL '{url}' does not start with '/'")
                     sys.exit(1)
        
        print("\n✅ SUCCESS: All URLs appear valid and relative.")
        
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

except Exception as e:
    print(f"Exception: {e}")
