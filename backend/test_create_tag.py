
import requests
import json

API_URL = "http://localhost:8000/api/tags"

def test_tags():
    print("--- TESTING TAGS API ---")
    
    # 1. List existing tags
    try:
        res = requests.get(f"{API_URL}")
        print(f"GET / tags: Status {res.status_code}")
        print(f"Existing tags: {res.json()}")
    except Exception as e:
        print(f"Error GET: {e}")
        return

    # 2. Create a new tag (simulating frontend)
    new_tag = {"name": "TestTagScript", "category": "yoga"}
    try:
        res = requests.post(f"{API_URL}", json=new_tag)
        print(f"POST / tags: Status {res.status_code}")
        if res.status_code == 200:
            print(f"Created: {res.json()}")
        else:
            print(f"Failed: {res.text}")
    except Exception as e:
        print(f"Error POST: {e}")

    # 3. List again to verify persistence
    try:
        res = requests.get(f"{API_URL}/?category=yoga")
        print(f"GET /?category=yoga: Status {res.status_code}")
        tags = res.json()
        print(f"Tags after create: {tags}")
        
        found = any(t['name'] == "TestTagScript" for t in tags)
        if found:
            print("✅ SUCCESS: Tag created and found!")
        else:
            print("❌ FAILURE: Tag created but not found in list.")
            
    except Exception as e:
        print(f"Error GET 2: {e}")

if __name__ == "__main__":
    test_tags()
