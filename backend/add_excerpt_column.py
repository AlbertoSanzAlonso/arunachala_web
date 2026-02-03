#!/usr/bin/env python3
"""Add excerpt column to contents table"""

from app.core.database import engine
from sqlalchemy import text

def add_excerpt_column():
    """Add excerpt column if it doesn't exist"""
    with engine.connect() as conn:
        # Check if column exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='contents' AND column_name='excerpt'
        """))
        
        if result.fetchone() is None:
            print("Adding excerpt column...")
            conn.execute(text("ALTER TABLE contents ADD COLUMN excerpt VARCHAR"))
            conn.commit()
            print("✅ Column 'excerpt' added successfully!")
        else:
            print("ℹ️  Column 'excerpt' already exists")

if __name__ == "__main__":
    add_excerpt_column()
