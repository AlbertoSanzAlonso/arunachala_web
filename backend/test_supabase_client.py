from dotenv import load_dotenv
load_dotenv()
from app.core.image_utils import supabase_client

buckets = supabase_client.storage.list_buckets()
for b in buckets:
    print(b.name)
