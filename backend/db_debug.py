from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://")

engine = create_engine(DATABASE_URL)

def check_counts():
    tables = ['users', 'contents', 'gallery', 'activities', 'yoga_classes', 'massage_types', 'therapy_types', 'tags']
    
    with engine.connect() as conn:
        for table in tables:
            try:
                res = conn.execute(text(f"SELECT count(*) FROM {table};"))
                count = res.fetchone()[0]
                print(f"Table {table:15}: {count} records")
                
                if table == 'contents':
                    res = conn.execute(text(f"SELECT type, count(*) FROM contents GROUP BY type;"))
                    for row in res:
                        print(f"  - {row[0]}: {row[1]}")
                
                if table == 'gallery':
                    res = conn.execute(text(f"SELECT category, count(*) FROM gallery GROUP BY category;"))
                    for row in res:
                        print(f"  - {row[0]}: {row[1]}")
                        
                if table == 'activities':
                    res = conn.execute(text(f"SELECT type, is_active, count(*) FROM activities GROUP BY type, is_active;"))
                    for row in res:
                        print(f"  - {row[0]} (active={row[1]}): {row[2]}")

            except Exception as e:
                print(f"Error checking {table}: {e}")

if __name__ == "__main__":
    check_counts()
