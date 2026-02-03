
#!/usr/bin/env python3
"""Sync contents table columns with model"""

from app.core.database import engine
from sqlalchemy import text

def sync_contents_table():
    """Add missing columns to contents table"""
    columns_to_check = {
        'category': 'VARCHAR',
        'excerpt': 'VARCHAR',
        'tags': 'JSON',
        'translations': 'JSON',
        'media_url': 'VARCHAR',
        'thumbnail_url': 'VARCHAR',
        'seo_title': 'VARCHAR',
        'seo_description': 'VARCHAR'
    }

    with engine.connect() as conn:
        print("Syncing contents table...")
        
        for col_name, col_type in columns_to_check.items():
            # Check if column exists
            result = conn.execute(text(f"""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='contents' AND column_name='{col_name}'
            """))
            
            if result.fetchone() is None:
                print(f"Adding missing column: {col_name} ({col_type})...")
                try:
                    conn.execute(text(f"ALTER TABLE contents ADD COLUMN {col_name} {col_type}"))
                    conn.commit()
                    print(f"✅ Column '{col_name}' added successfully!")
                except Exception as e:
                    print(f"❌ Failed to add column '{col_name}': {e}")
            else:
                print(f"✓ Column '{col_name}' already exists")
                
        print("Sync complete.")

if __name__ == "__main__":
    sync_contents_table()
