import os
from dotenv import load_dotenv
load_dotenv(".env")
from app.core.image_utils import supabase_client
import mimetypes

bucket_name = "arunachala-images"
static_dir = "static"

print("Starting Supabase upload of static files...")

for root, _, files in os.walk(static_dir):
    for filename in files:
        filepath = os.path.join(root, filename)
        
        # We want to upload to "gallery/articles/..." to match the local static folder.
        # But if we just upload to the exact same relative path inside `static/`, it will be:
        # e.g., "gallery/articles/om_symbol.webp"
        rel_path = os.path.relpath(filepath, static_dir) 
        
        mime = "image/webp"
        if filename.endswith(".jpg") or filename.endswith(".jpeg"):
            mime = "image/jpeg"
        elif filename.endswith(".png"):
            mime = "image/png"
        elif filename.endswith(".mp3"):
            mime = "audio/mpeg"
            
        print(f"Uploading {filepath} -> {rel_path} ({mime})")
        
        try:
            with open(filepath, 'rb') as f:
                res = supabase_client.storage.from_(bucket_name).upload(
                    file=f.read(),
                    path=rel_path,
                    file_options={"content-type": mime, "upsert": "true"}
                )
                print(f"Success: {rel_path}")
        except Exception as e:
            print(f"Error uploading {rel_path}: {e}")

print("Upload completed.")
