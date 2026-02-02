
from app.core.database import engine
from sqlalchemy import text

def drop_config_table():
    print(f"Connecting to DB: {engine.url}")
    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS agent_config"))
        conn.commit()
    print("Table agent_config dropped.")

if __name__ == "__main__":
    drop_config_table()
