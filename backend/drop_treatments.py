from app.core.database import engine
from sqlalchemy import text

def drop_tables():
    with engine.connect() as connection:
        # Commit any open transaction
        connection.commit()
        
        print("Dropping massage_types table...")
        try:
            connection.execute(text("DROP TABLE IF EXISTS massage_types CASCADE"))
            print("Dropped massage_types.")
        except Exception as e:
            print(f"Error dropping massage_types: {e}")

        print("Dropping therapy_types table...")
        try:
            connection.execute(text("DROP TABLE IF EXISTS therapy_types CASCADE"))
            print("Dropped therapy_types.")
        except Exception as e:
            print(f"Error dropping therapy_types: {e}")
            
        connection.commit()

if __name__ == "__main__":
    drop_tables()
