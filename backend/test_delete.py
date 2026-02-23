from dotenv import load_dotenv
import os

load_dotenv()
from app.core.image_utils import supabase_client

try:
    print("Uploading test file...")
    supabase_client.storage.from_("arunachala-images").upload("test-delete-file.txt", b"hello world")
    print("Uploaded!")

    print("Deleting test file...")
    res = supabase_client.storage.from_("arunachala-images").remove(["test-delete-file.txt"])
    print("Delete response:", res)
except Exception as e:
    print("Error:", e)
