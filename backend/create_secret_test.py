
import httpx
import asyncio
import json

BASE_URL = "http://localhost:8000/api/content"

async def create_secret_article():
    # 1. Definir el artículo con la frase secreta
    article_data = {
        "title": "El Secreto del Loto Azul",
        "slug": "secreto-loto-azul",
        "body": "# El Misterio Revelado\n\nEn las antiguas escrituras de Arunachala, se menciona una verdad oculta solo para los iniciados.\n\nLa frase secreta que abre las puertas de la percepción es: **\"El loto azul florece en la luna llena de invierno.\"**\n\nGuárdala en tu corazón.",
        "excerpt": "Un artículo misterioso con una clave oculta.",
        "type": "article",
        "category": "general",
        "status": "published", 
        "translations": {}
    }
    
    # 2. Enviar POST al backend
    async with httpx.AsyncClient() as client:
        print("📤 Creando artículo SECRETO...")
        response = await client.post(BASE_URL, json=article_data)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Artículo creado: ID {data['id']} - {data['title']}")
            print("⏳ El webhook se ha disparado. Espera unos segundos y pregunta al chat.")
        else:
            print(f"❌ Error al crear: {response.text}")

if __name__ == "__main__":
    asyncio.run(create_secret_article())
