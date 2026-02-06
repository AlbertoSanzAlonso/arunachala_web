
import os
import hashlib
from app.core.database import SessionLocal
from app.models.models import Content
from qdrant_client import QdrantClient
from qdrant_client.http import models as rest
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Config
QDRANT_URL = "http://localhost:6333"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
COLLECTION_NAME = "arunachala_knowledge_base"

def inject_article(content_id):
    print(f"🔄 Injecting article #{content_id} directly into Qdrant...")
    
    # 1. Fetch from SQL
    db = SessionLocal()
    article = db.query(Content).filter(Content.id == content_id).first()
    if not article:
        print("❌ Article not found in SQL")
        return
    
    title = article.title
    content = article.body or article.excerpt
    slug = article.slug
    type_ = "content" # or 'article'
    
    db.close()
    
    print(f"📖 Found: {title}")
    
    # 2. Embedding
    if not OPENAI_API_KEY:
        print("❌ OPENAI_API_KEY not found")
        return

    client_ai = OpenAI(api_key=OPENAI_API_KEY)
    
    # Text to vectorise: Title + Content
    text_to_embed = f"{title}\n\n{content}"
    
    try:
        response = client_ai.embeddings.create(
            input=text_to_embed,
            model="text-embedding-3-small"
        )
        vector = response.data[0].embedding
        print("✅ Vector generated successfully")
    except Exception as e:
        print(f"❌ OpenAI Error: {e}")
        return

    # 3. Upload to Qdrant
    q_client = QdrantClient(url=QDRANT_URL)
    
    # Deterministic ID (same as n8n logic if possible, or just unique)
    unique_str = f"{type_}_{content_id}"
    point_id = hashlib.md5(unique_str.encode()).hexdigest()
    
    payload = {
        "title": title,
        "content": content,
        "slug": slug,
        "type": type_,
        "category": article.category,
        "id": content_id
    }
    
    try:
        q_client.upsert(
            collection_name=COLLECTION_NAME,
            points=[
                rest.PointStruct(
                    id=point_id,
                    vector=vector,
                    payload=payload
                )
            ]
        )
        print(f"🚀 Successfully injected Point ID: {point_id}")
        
        # Verify
        p = q_client.retrieve(COLLECTION_NAME, ids=[point_id])
        if p:
            print(f"🔎 Verified in Qdrant: {p[0].payload['title']}")
            
    except Exception as e:
        print(f"❌ Qdrant Error: {e}")

if __name__ == "__main__":
    inject_article(17)
