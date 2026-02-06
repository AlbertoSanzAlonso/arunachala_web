
import os
from qdrant_client import QdrantClient
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Config
QDRANT_URL = "http://localhost:6333"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
COLLECTION_NAME = "arunachala_knowledge_base"

def debug_query(query_text):
    print(f"🔎 DEBUG QUERY: '{query_text}'")
    
    # 1. Generate Embedding
    client_ai = OpenAI(api_key=OPENAI_API_KEY)
    response = client_ai.embeddings.create(
        input=query_text,
        model="text-embedding-3-small"
    )
    query_vector = response.data[0].embedding
    
    # 2. Search Qdrant
    client_q = QdrantClient(url=QDRANT_URL)
    results = client_q.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=5
    ).points
    
    print(f"✅ Found {len(results)} results:")
    for i, res in enumerate(results):
        payload = res.payload
        title = payload.get('title', 'NO TITLE')
        content = payload.get('content', '')[:100].replace('\n', ' ')
        score = res.score
        print(f"   {i+1}. [Score: {score:.4f}] {title} | Content: {content}...")

if __name__ == "__main__":
    debug_query("de qué trata la prueba de automatizacion")
