import os
from dotenv import load_dotenv
load_dotenv(".env")
from app.core.image_utils import supabase_client
import mimetypes

bucket_name = "arunachala-images"
static_dir = "static"

for root, _, files in os.walk(static_dir):
    for filename in files:
        filepath = os.path.join(root, filename)
        # remove 'static/' from start to get supabase path
        # wait, let's keep it under 'static/...' or upload to root?
        # If we uploaded to root: 'articles/om_symbol.webp' instead of 'static/gallery/articles/om_symbol.webp'.
        # Let's write them to the exact path the old db used: "gallery/" + folder + "/" + name
        # Actually in Supabase they should just match the exact '/static/...' path so `getImageUrl` can easily map it!
        # Let's upload to "gallery/..." instead of 'static/...'
        # So "static/gallery/articles/om_symbol.webp" -> "gallery/articles/om_symbol.webp"
        
        rel_path = os.path.relpath(filepath, static_dir) # e.g. "gallery/articles/om_symbol.webp"
        
        mime = "image/webp" if filename.endswith(".webp") else "image/jpeg"
        if filename.endswith(".mp3"):
             mime = "audio/mpeg"
        
        print(f"Uploading {filepath} to {rel_path}...")
        try:
            with open(filepath, 'rb') as f:
                supabase_client.storage.from_(bucket_name).upload(
                    file=f.read(),
                    path=rel_path,
                    file_options={"content-type": mime, "upsert": "true"}
                )
        except Exception as e:
            print(f"Error: {e}")

print("Done")
