from dotenv import load_dotenv
load_dotenv()
from app.core.image_utils import supabase_client

bucket_name = "arunachala-images"
file_path = "gallery/home/test.txt"
url = supabase_client.storage.from_(bucket_name).get_public_url(file_path)
print("Type:", type(url))
print("String representation:", str(url))
print("Direct URL:", url)
