
import asyncio
import os
from app.core.database import SessionLocal
from app.models.models import Content
from app.core.webhooks import notify_n8n_content_change

async def force_sync():
    db = SessionLocal()
    try:
        content_id = 17
        article = db.query(Content).filter(Content.id == content_id).first()
        if article:
            print(f"Found article: {article.title}")
            print(f"Body length: {len(article.body) if article.body else 0}")
            
            # Force update notification with FULL payload
            await notify_n8n_content_change(
                content_id=article.id,
                content_type='content',  # or 'article' depending on n8n config, usually 'content' map matches
                action='update',
                db=db,
                entity=article
            )
            print("Notification sent!")
        else:
            print("Article 17 not found")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(force_sync())
