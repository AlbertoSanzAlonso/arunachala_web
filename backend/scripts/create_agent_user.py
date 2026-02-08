
import os
import sys

# Add backend root to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from app.core.database import SessionLocal
from app.models.models import User, UserRole
from sqlalchemy import text

def create_agent_user():
    db = SessionLocal()
    try:
        # Reset sequence just in case
        db.execute(text("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))"))
        db.commit()

        # Check if agent exists
        agent = db.query(User).filter(User.email == "ai_agent@arunachala.com").first()

        if agent:
            print(f"✅ Agent user already exists: {agent.first_name} (ID: {agent.id})")
            # Update name if needed
            if agent.first_name != "ArunachalaBot":
                agent.first_name = "ArunachalaBot"
                db.commit()
                print("🔄 Updated Agent name to ArunachalaBot")
            return

        print("🤖 Creating AI Agent user...")
        new_agent = User(
            email="ai_agent@arunachala.com",
            # Password hash dummy
            password_hash="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxwKc.6qVIZp.g3y/0e.e/1.1.1", 
            first_name="ArunachalaBot",
            last_name="",
            role=UserRole.ADMIN,
            profile_picture="/static/images/ai_avatar.png"
        )
        db.add(new_agent)
        db.commit()
        db.refresh(new_agent)
        print(f"✨ Agent created successfully! ID: {new_agent.id}")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_agent_user()
