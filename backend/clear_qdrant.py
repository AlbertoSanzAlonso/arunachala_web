import os
from qdrant_client import QdrantClient
from dotenv import load_dotenv

# Configuration
load_dotenv()
QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", 6333))
COLLECTION_NAME = "arunachala_knowledge_base"

# Client
qdrant_client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

def clear_collection():
    try:
        print(f"Deleting collection: {COLLECTION_NAME}...")
        qdrant_client.delete_collection(collection_name=COLLECTION_NAME)
        print(f"Collection {COLLECTION_NAME} deleted successfully.")
    except Exception as e:
        print(f"Error deleting collection: {e}")

if __name__ == "__main__":
    clear_collection()
