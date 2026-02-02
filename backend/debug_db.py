from app.core.database import engine, Base
from app.models.models import AgentConfig
from sqlalchemy import inspection, text

def check_db():
    insp = inspection.inspect(engine)
    if not insp.has_table("agent_config"):
        print("Table 'agent_config' does NOT exist.")
        # Create it
        Base.metadata.create_all(bind=engine)
        print("Table created.")
    else:
        print("Table 'agent_config' exists.")
        columns = [c['name'] for c in insp.get_columns("agent_config")]
        print(f"Columns: {columns}")
        
    # verify connection and query
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT * FROM agent_config"))
            print("Query executed success.")
            for row in result:
                print(row)
    except Exception as e:
        print(f"Query failed: {e}")

if __name__ == "__main__":
    check_db()
