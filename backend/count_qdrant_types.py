
import os
from qdrant_client import QdrantClient
from dotenv import load_dotenv

load_dotenv()

QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", 6333))
COLLECTION_NAME = "arunachala_knowledge_base"

client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

print(f"--- Type Distribution in {COLLECTION_NAME} ---")
points, _ = client.scroll(
    collection_name=COLLECTION_NAME,
    limit=1000,
    with_payload=True,
    with_vectors=False
)

counts = {}
for p in points:
    t = p.payload.get('type', 'unknown')
    counts[t] = counts.get(t, 0) + 1

for t, count in counts.items():
    print(f"{t}: {count}")
