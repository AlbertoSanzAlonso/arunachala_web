import os
import sys

# Attempt to load from env
from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import text
from app.core.database import engine

def run():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE contents ADD COLUMN view_count INTEGER DEFAULT 0;"))
            conn.commit()
            print("Successfully added view_count to contents table.")
        except Exception as e:
            if "already exists" in str(e) or "Duplicate column name" in str(e):
                print("Column view_count already exists.")
            else:
                print(f"Error: {e}")

if __name__ == "__main__":
    run()
