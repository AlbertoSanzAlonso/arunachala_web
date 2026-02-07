
import os
from qdrant_client import QdrantClient
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", 6333))
COLLECTION_NAME = "arunachala_knowledge_base"

client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)
openai_client = OpenAI(api_key=OPENAI_API_KEY)

def get_embedding(text: str):
    text = text.replace("\n", " ")
    return openai_client.embeddings.create(input=[text], model="text-embedding-3-small").data[0].embedding

def search(query, limit=3):
    vector = get_embedding(query)
    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=vector,
        limit=limit
    ).points
    return results

print("--- Query: cuantas meditaciones teneis? (limit=3) ---")
results = search("cuantas meditaciones teneis?", limit=3)
for r in results:
    payload = r.payload
    print(f"ID: {r.id}, Title: {payload.get('metadata', {}).get('name') or payload.get('title')}, Score: {r.score}")

print("\n--- Query: cuantas meditaciones teneis? (limit=10) ---")
results = search("cuantas meditaciones teneis?", limit=10)
for r in results:
    payload = r.payload
    print(f"ID: {r.id}, Title: {payload.get('metadata', {}).get('name') or payload.get('title')}, Score: {r.score}")
