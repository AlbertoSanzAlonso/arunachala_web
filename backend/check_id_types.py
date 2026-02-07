
import os
from qdrant_client import QdrantClient
from dotenv import load_dotenv

load_dotenv()

QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", 6333))
COLLECTION_NAME = "arunachala_knowledge_base"

client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

print(f"--- Checking ID types in {COLLECTION_NAME} ---")
points, _ = client.scroll(
    collection_name=COLLECTION_NAME,
    limit=10,
    with_payload=False,
    with_vectors=False
)

for p in points:
    print(f"ID: {p.id}, Type: {type(p.id)}")
