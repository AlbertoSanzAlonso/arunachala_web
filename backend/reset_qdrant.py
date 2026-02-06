
from qdrant_client import QdrantClient
from qdrant_client.http import models

def reset_kb():
    # Connect
    q_client = QdrantClient(url="http://localhost:6333")
    COLLECTION_NAME = "arunachala_knowledge_base"
    
    # 1. Delete
    try:
        q_client.delete_collection(COLLECTION_NAME)
        print(f"🗑️ Deleted collection: {COLLECTION_NAME}")
    except Exception as e:
        print(f"⚠️ Collection might not exist: {e}")
        
    # 2. Recreate
    try:
        q_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(size=1536, distance=models.Distance.COSINE)
        )
        print(f"✨ Created fresh collection: {COLLECTION_NAME}")
    except Exception as e:
        print(f"❌ Failed to create collection: {e}")

if __name__ == "__main__":
    reset_kb()
