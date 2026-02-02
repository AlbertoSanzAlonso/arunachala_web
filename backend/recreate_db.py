from app.core.database import engine, Base
from app.models import models

def recreate_db():
    print("Dropping all tables...")
    models.Base.metadata.drop_all(bind=engine)
    print("Creating all tables with new schema...")
    models.Base.metadata.create_all(bind=engine)
    print("Database recreated successfully.")

if __name__ == "__main__":
    recreate_db()
