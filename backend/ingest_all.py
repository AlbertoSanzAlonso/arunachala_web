import os
import sys
import uuid
from sqlalchemy.orm import Session
from qdrant_client import QdrantClient
from qdrant_client.http import models
from openai import OpenAI
from dotenv import load_dotenv

# Setup path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.models import YogaClassDefinition, ClassSchedule, MassageType, TherapyType, Content

# Configuration
load_dotenv()
QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", 6333))
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
COLLECTION_NAME = "arunachala_knowledge_base"

# Clients
qdrant_client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)
openai_client = OpenAI(api_key=OPENAI_API_KEY)

def get_embedding(text: str):
    text = text.replace("\n", " ")
    return openai_client.embeddings.create(input=[text], model="text-embedding-3-small").data[0].embedding

def ensure_collection():
    try:
        collections = qdrant_client.get_collections()
        if not any(c.name == COLLECTION_NAME for c in collections.collections):
            print(f"Creating collection {COLLECTION_NAME}...")
            qdrant_client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=models.VectorParams(size=1536, distance=models.Distance.COSINE)
            )
        else:
            print(f"Collection {COLLECTION_NAME} already exists.")
    except Exception as e:
        print(f"Error checking/creating collection: {e}")

def ingest_item(content: str, source: str, metadata: dict = None):
    print(f"Ingesting from source: {source}...")
    vector = get_embedding(content)
    point_id = str(uuid.uuid4())
    
    payload = {"content": content, "source": source}
    if metadata:
        payload.update(metadata)
        
    qdrant_client.upsert(
        collection_name=COLLECTION_NAME,
        points=[
            models.PointStruct(
                id=point_id,
                vector=vector,
                payload=payload
            )
        ]
    )

def main():
    if not OPENAI_API_KEY:
        print("Error: OPENAI_API_KEY not found in environment variables.")
        return

    ensure_collection()
    db = SessionLocal()

    try:
        # 1. Yoga Classes & Schedules
        print("Processing Yoga Classes...")
        yoga_classes = db.query(YogaClassDefinition).all()
        for yc in yoga_classes:
            schedules = db.query(ClassSchedule).filter(ClassSchedule.class_id == yc.id).all()
            schedule_text = ", ".join([f"{s.day_of_week} {s.start_time}-{s.end_time}" for s in schedules])
            
            content = f"Clase de Yoga: {yc.name}\nDescripción: {yc.description}\nHorarios: {schedule_text if schedule_text else 'Consultar disponibilidad'}"
            ingest_item(content, source="yoga_page", metadata={"type": "yoga_class", "id": yc.id})

        # 2. Massages
        print("Processing Massages...")
        massages = db.query(MassageType).all()
        for m in massages:
            content = f"Masaje: {m.name}\nDescripción: {m.description}\nBeneficios: {m.benefits}\nDuración: {m.duration_min} min"
            ingest_item(content, source="therapies_page", metadata={"type": "massage", "id": m.id})

        # 3. Therapies
        print("Processing Therapies...")
        therapies = db.query(TherapyType).all()
        for t in therapies:
            content = f"Terapia Holística: {t.name}\nDescripción: {t.description}\nBeneficios: {t.benefits}\nDuración: {t.duration_min} min"
            ingest_item(content, source="therapies_page", metadata={"type": "therapy", "id": t.id})

        # 4. Articles / Content
        print("Processing Published Articles...")
        articles = db.query(Content).filter(Content.status == "published").all()
        for art in articles:
            content = f"Artículo: {art.title}\n{art.body}"
            ingest_item(content, source="blog", metadata={"type": "article", "id": art.id})

        # 5. General Center Info (Static)
        print("Processing General Info...")
        general_info = """
Arunachala es un centro de bienestar especializado en Yoga y Terapias Holísticas ubicado en Cornellà de Llobregat.
Dirección: Carrer del Bruc, 44, 08940 Cornellà de Llobregat, Barcelona.
Contacto Teléfono/WhatsApp: +34 622 35 15 25
Email: info@arunachala.com (o el formulario de la web).
El centro ofrece un ambiente calmado y acogedor ideal para la práctica meditativa y sanación corporal.
Ofrecemos clases de Hatha Yoga, Vinyasa Flow, Yoga para niños y mujeres embarazadas. También terapias como Reiki, Flores de Bach y diversos tipos de masajes (Ayurvédico, Tailandés, etc).
        """.strip()
        ingest_item(general_info, source="about_us")

        print("Ingestion completed successfully!")

    except Exception as e:
        print(f"Error during ingestion: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
