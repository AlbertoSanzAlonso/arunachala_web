
import sys
import os
sys.path.append(os.getcwd())

try:
    from app.main import app
    print("✅ App loaded successfully")
    for route in app.routes:
        if "/api/tags" in str(route.path):
            print(f"📍 Route found: {route.path} {route.methods}")
except Exception as e:
    print(f"❌ Error loading app: {e}")
