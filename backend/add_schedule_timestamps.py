#!/usr/bin/env python3
"""Add timestamps to schedules table"""

from app.core.database import engine
from sqlalchemy import text

def add_schedule_timestamps():
    """Add created_at and updated_at columns to schedules table"""
    with engine.connect() as conn:
        print("Adding timestamp columns to schedules table...")
        
        # Check if created_at exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='schedules' AND column_name='created_at'
        """))
        
        if result.fetchone() is None:
            print("Adding created_at column...")
            conn.execute(text("""
                ALTER TABLE schedules 
                ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            """))
            conn.commit()
            print("✅ Column 'created_at' added successfully!")
        else:
            print("ℹ️  Column 'created_at' already exists")
        
        # Check if updated_at exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='schedules' AND column_name='updated_at'
        """))
        
        if result.fetchone() is None:
            print("Adding updated_at column...")
            conn.execute(text("""
                ALTER TABLE schedules 
                ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE
            """))
            conn.commit()
            print("✅ Column 'updated_at' added successfully!")
        else:
            print("ℹ️  Column 'updated_at' already exists")

if __name__ == "__main__":
    add_schedule_timestamps()
