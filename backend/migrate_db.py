import os
import sqlalchemy as sa
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv
import sys
import json
from datetime import datetime

# Ensure we can import app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.models.models import Base

load_dotenv()

LOCAL_URL = "postgresql://arunachala:arunachala1234@localhost:5432/arunachala_db"
CLOUD_URL = "postgresql://neondb_owner:npg_fL4z6dKanCXW@ep-lingering-cell-ahlfz6wn-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

local_engine = sa.create_engine(LOCAL_URL)
cloud_engine = sa.create_engine(CLOUD_URL)

TABLES_TO_MIGRATE = [
    "users",
    "contents",
    "activities",
    "massage_types",
    "therapy_types",
    "yoga_classes",
    "gallery",
    "schedules",
    "notification",
    "agent_config",
    "dashboard_activities"
]

def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError ("Type %s not serializable" % type(obj))

def reset_cloud_and_migrate():
    print("--- 🔄 Synchronizing Cloud Database Schema ---")
    try:
        with cloud_engine.connect() as conn:
            print("Dropping existing tables in cloud...")
            for table in reversed(Base.metadata.sorted_tables):
                conn.execute(sa.text(f"DROP TABLE IF EXISTS {table.name} CASCADE"))
                conn.commit()
        
        print("Creating tables with updated schema in cloud...")
        Base.metadata.create_all(cloud_engine)
        print("Schema sync complete.")
    except Exception as e:
        print(f"Error syncing schema: {e}")
        return

    print("\n--- 🚀 Starting Data Migration ---")
    with local_engine.connect() as local_conn:
        # We process each table in a separate transaction to avoid aborting the whole process
        for table_name in TABLES_TO_MIGRATE:
            print(f"Migrating {table_name}...")
            try:
                # Get data from local
                result = local_conn.execute(sa.text(f"SELECT * FROM {table_name}"))
                rows = [dict(row._mapping) for row in result]
                
                if not rows:
                    print(f"  Table {table_name} is empty. Skipping.")
                    continue
                
                # Prepare rows: convert dicts/lists to JSON strings for psycopg2
                for row in rows:
                    for key, value in row.items():
                        if isinstance(value, (dict, list)):
                            row[key] = json.dumps(value)
                
                # Insert into cloud
                with cloud_engine.connect() as cloud_conn:
                    columns = rows[0].keys()
                    placeholders = ", ".join([f":{col}" for col in columns])
                    columns_str = ", ".join(columns)
                    insert_stmt = sa.text(f"INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders})")
                    
                    cloud_conn.execute(insert_stmt, rows)
                    cloud_conn.commit()
                    print(f"  ✅ Migrated {len(rows)} rows to {table_name}")
            except Exception as e:
                print(f"  ❌ Error migrating {table_name}: {e}")

if __name__ == "__main__":
    reset_cloud_and_migrate()
