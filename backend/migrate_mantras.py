from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv
import json

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://")

engine = create_engine(DATABASE_URL)

DEFAULT_MANTRAS = [
    {"text": "Lokah Samastah Sukhino Bhavantu", "translation": "Que todos los seres en todas partes sean felices y libres"},
    {"text": "Om Namah Shivaya", "translation": "Honro la divinidad que habita en mí"},
    {"text": "Sat Nam", "translation": "La verdad es mi identidad"},
    {"text": "Om Shanti Shanti Shanti", "translation": "Paz, paz, paz"},
    {"text": "So Hum", "translation": "Yo soy eso"},
    {"text": "Om Gam Ganapataye Namaha", "translation": "Saludos al eliminador de obstáculos"},
    {"text": "Om Mani Padme Hum", "translation": "La joya está en el loto"},
    {"text": "Tayata Om Bekanze Bekanze", "translation": "Mantra de la medicina para la sanación"}
]

def migrate():
    with engine.connect() as conn:
        print("Creating mantras table...")
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS mantras (
                id SERIAL PRIMARY KEY,
                text_sanskrit TEXT NOT NULL,
                translation TEXT NOT NULL,
                is_predefined BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """))
        
        # Check if empty
        res = conn.execute(text("SELECT count(*) FROM mantras;")).fetchone()
        if res[0] == 0:
            print("Seeding default mantras...")
            for m in DEFAULT_MANTRAS:
                conn.execute(text("""
                    INSERT INTO mantras (text_sanskrit, translation, is_predefined)
                    VALUES (:t, :tr, TRUE);
                """), {"t": m["text"], "tr": m["translation"]})
        
        conn.commit()
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
