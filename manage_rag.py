import requests
import json
import time

ADMIN_SECRET = "admin123"
BASE_URL = "https://api.yogayterapiasarunachala.es/api"

def wipe():
    print("🧹 Wiping all RAG memory in Production...")
    url = f"{BASE_URL}/chat-memory-reset"
    payload = {"scope": "all"}
    params = {"secret": ADMIN_SECRET}
    try:
        response = requests.post(url, json=payload, params=params)
        if response.status_code == 200:
            print("✅ Memory wiped successfully.")
        else:
            print(f"❌ Wipe failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error wiping: {e}")

def ingest(content, source):
    print(f"📤 Ingesting: {source}")
    url = f"{BASE_URL}/ingest"
    payload = {
        "secret": ADMIN_SECRET,
        "content": content,
        "source": source
    }
    try:
        response = requests.post(url, params=payload)
        if response.status_code == 200:
            print(f"✅ Success: {source}")
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error: {e}")

def diagnostics():
    print("🔍 Running RAG Diagnostics...")
    url = f"{BASE_URL}/rag-diagnostics"
    params = {"secret": ADMIN_SECRET}
    try:
        response = requests.get(url, params=params)
        if response.status_code == 200:
            data = response.json()
            print(f"📊 Total Vectors: {data.get('total_vectors')}")
            print(f"🏢 By Type: {data.get('by_type')}")
            if data.get('content_samples'):
                 print("📝 Samples:")
                 for t, s in data['content_samples'].items():
                      print(f"  - {t}: {s}")
        else:
            print(f"❌ Diagnostics failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error: {e}")

# Static content
about_me = """
Sobre Susana Pérez Gil y Aruṇāchala:
Mi nombre es Susana Pérez Gil y desde hace años acompaño a personas a través del Yoga y las Terapias Manuales, integrando cuerpo, mente y dimensión emocional-espiritual.
Mi camino comenzó hace más de 25 años, impulsado por una profunda inspiración por la India, su cultura y su espiritualidad. 
Especialidades:
- Terapias Manuales: Quiromasaje, Drenaje Linfático, Reflexología y digitopresión.
- Técnicas Sutiles: Técnica Metamórfica y Reiki.
- Yoga: Profesora con formación amplia en diferentes etapas vitales.
Origen: El nombre Aruṇāchala nació tras el ascenso a la Montaña Sagrada Aruṇāchala en India.
Ubicación: Cornellá de Llobregat, Barcelona. Pasaje de Mateo Oliva 3.
"""

our_space = """
Nuestro Espacio en Aruṇāchala:
Ubicado en Cornellá de Llobregat (Pasaje de Mateo Oliva 3, bajos). Es un refugio de paz diseñado para la calma.
Equipamiento: Sala diáfana, luz natural, materiales orgánicos.
Acceso:
- Tranvía: T1-T2 (El Pedró)
- Autobús: 57, 68, 94, 95
- Metro: L5 (Cornellá Centre)
"""

contact_info = """
Contacto Aruṇāchala:
Dirección: Pasaje de Mateo Oliva 3, bajos, 08940 Cornellá de Llobregat, Barcelona.
Email: yogayterapiasarunachala@gmail.com
WhatsApp: Trato directo para reservas y dudas.
Cita previa: Todos los masajes y terapias se programan de forma individualizada.
"""

if __name__ == "__main__":
    print("--- Arunachala RAG Management ---")
    diagnostics()
    wipe() # Uncomment to wipe before ingesting
    ingest(about_me, "page_about")
    ingest(our_space, "page_space")
    ingest(contact_info, "page_contact")
    time.sleep(1)
    diagnostics()
