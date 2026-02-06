
import httpx
import asyncio
import json

BASE_URL = "http://localhost:8000/api/content"

async def create_test_article():
    # 1. Definir el artículo
    article_data = {
        "title": "Prueba de Automatización RAG",
        "slug": "prueba-automatizacion-rag",
        "body": "# Prueba de éxito\n\nSi este artículo aparece en el chat con su título correcto, significa que n8n ha procesado el webhook perfectamente.\n\nLa automatización funciona.",
        "excerpt": "Artículo temporal para validar el flujo completo.",
        "type": "article",
        "category": "general",
        "status": "published", # Importante: solo los published disparan el webhook
        "translations": {}
    }
    
    # 2. Enviar POST al backend
    async with httpx.AsyncClient() as client:
        print("📤 Creando artículo de prueba...")
        response = await client.post(BASE_URL, json=article_data)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Artículo creado: ID {data['id']} - {data['title']}")
            print("⏳ Esperando 10 segundos a que n8n procese...")
            await asyncio.sleep(10)
            return data['id']
        else:
            print(f"❌ Error al crear: {response.text}")
            return None

if __name__ == "__main__":
    import asyncio
    asyncio.run(create_test_article())
