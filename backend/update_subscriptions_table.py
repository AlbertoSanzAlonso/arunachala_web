from sqlalchemy import text
from app.core.database import engine

def update_subscriptions():
    print("Actualizando tabla 'subscriptions' en PostgreSQL...")
    
    with engine.connect() as conn:
        # Check if columns exist
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='subscriptions' AND column_name='first_name'
        """))
        if not result.fetchone():
            print("Añadiendo columna 'first_name'...")
            conn.execute(text("ALTER TABLE subscriptions ADD COLUMN first_name VARCHAR(255)"))
            conn.commit()
        else:
            print("La columna 'first_name' ya existe.")

        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='subscriptions' AND column_name='language'
        """))
        if not result.fetchone():
            print("Añadiendo columna 'language'...")
            conn.execute(text("ALTER TABLE subscriptions ADD COLUMN language VARCHAR(255) DEFAULT 'es'"))
            conn.commit()
        else:
            print("La columna 'language' ya existe.")
            
    print("Actualización completada.")

if __name__ == "__main__":
    try:
        update_subscriptions()
    except Exception as e:
        print(f"Error: {e}")
