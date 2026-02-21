from app.core.database import SessionLocal
from app.models.models import User
from passlib.context import CryptContext
import sys

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin(email, password):
    db = SessionLocal()
    try:
        # Check if user exists
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"User {email} already exists. Updating password and role to admin...")
            existing.password_hash = pwd_context.hash(password)
            existing.role = "admin"
        else:
            print(f"Creating new admin user: {email}")
            user = User(
                email=email,
                password_hash=pwd_context.hash(password),
                role="admin",
                first_name="Admin",
                last_name="Arunachala"
            )
            db.add(user)
        
        db.commit()
        print("✅ Admin user created/updated successfully!")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python create_admin.py <email> <password>")
    else:
        create_admin(sys.argv[1], sys.argv[2])
