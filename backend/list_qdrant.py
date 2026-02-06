
from qdrant_client import QdrantClient

def list_titles():
    client = QdrantClient(url="http://localhost:6333")
    
    scroll_result = client.scroll(
        collection_name="arunachala_knowledge_base",
        limit=100,
        with_payload=True
    )
    
    print(f"Total points: {len(scroll_result[0])}")
    print("-" * 40)
    for point in scroll_result[0]:
        t = point.payload.get('title', 'NO TITLE')
        c = point.payload.get('content', '')
        print(f"[{point.id}] {t} (Len: {len(c)})")

if __name__ == "__main__":
    list_titles()
