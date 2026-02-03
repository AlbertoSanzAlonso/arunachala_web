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
from app.models.models import YogaClassDefinition, ClassSchedule, MassageType, TherapyType, Content, Activity

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

import hashlib

def get_qdrant_id(item_type: str, item_id: int):
    """Genera el mismo ID que n8n usando hash MD5."""
    seed = f"{item_type}_{item_id}"
    return hashlib.md5(seed.encode()).hexdigest()

def ingest_item(content: str, source: str, item_type: str, item_id: int, metadata: dict = None):
    print(f"Ingesting {item_type} {item_id} from source: {source}...")
    vector = get_embedding(content)
    point_id = get_qdrant_id(item_type, item_id)
    
    payload = {
        "content": content, 
        "source": source,
        "type": item_type,
        "updated_at": uuid.uuid4().hex # Temporal timestamp reference
    }
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
            ingest_item(content, source="yoga_page", item_type="yoga_class", item_id=yc.id, metadata={"id": yc.id})

        # 2. Massages
        print("Processing Massages...")
        massages = db.query(MassageType).all()
        for m in massages:
            content = f"Masaje: {m.name}\nDescripción: {m.description}\nBeneficios: {m.benefits}\nDuración: {m.duration_min} min"
            ingest_item(content, source="therapies_page", item_type="massage", item_id=m.id, metadata={"id": m.id})

        # 3. Therapies
        print("Processing Therapies...")
        therapies = db.query(TherapyType).all()
        for t in therapies:
            content = f"Terapia Holística: {t.name}\nDescripción: {t.description}\nBeneficios: {t.benefits}\nDuración: {t.duration_min} min"
            ingest_item(content, source="therapies_page", item_type="therapy", item_id=t.id, metadata={"id": t.id})

        # 4. Articles / Content
        print("Processing Published Articles...")
        articles = db.query(Content).filter(Content.status == "published").all()
        for art in articles:
            content = f"Artículo: {art.title}\n{art.body}"
            ingest_item(content, source="blog", item_type="content", item_id=art.id, metadata={"id": art.id})

        # 5. Activities (New)
        print("Processing Activities...")
        activities = db.query(Activity).filter(Activity.is_active == True).all()
        for act in activities:
            date_info = f"Fecha: {act.start_date.strftime('%d/%m/%Y %H:%M')}" if act.start_date else "Fecha a consultar"
            content = f"Actividad/Curso: {act.title}\nTipo: {act.type}\n{date_info}\nLugar: {act.location if act.location else 'Centro Arunachala'}\nPrecio: {act.price if act.price else 'Consultar'}\nDescripción: {act.description}"
            ingest_item(content, source="activities_page", item_type="activity", item_id=act.id, metadata={"id": act.id})

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
        ingest_item(general_info, source="about_us", item_type="static", item_id=0)

        print("Ingestion completed successfully!")

    except Exception as e:
        print(f"Error during ingestion: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
