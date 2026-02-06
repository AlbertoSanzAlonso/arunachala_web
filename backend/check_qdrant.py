
from qdrant_client import QdrantClient

def check_qdrant():
    client = QdrantClient(url="http://localhost:6333")
    
    # Scroll all points
    scroll_result = client.scroll(
        collection_name="arunachala_knowledge_base",
        limit=100,
        with_payload=True,
        with_vectors=False
    )
    
    found = False
    print(f"Total points found: {len(scroll_result[0])}")
    
    for point in scroll_result[0]:
        payload = point.payload
        type_ = payload.get('type')
        title = payload.get('title', 'No Title') or 'No Title'
        
        if 'espalda' in title.lower():
            found = True
            print(f"\n[FOUND] ID: {point.id}")
            print(f"Type: {type_}")
            print(f"Title: {title}")
            content = payload.get('content', '')
            print(f"Content length: {len(content)}")
            print(f"Content preview: {content[:200]}...")
            
    if not found:
        print("\n[ERROR] Article about 'espalda' NOT FOUND in Qdrant.")

if __name__ == "__main__":
    check_qdrant()
