
import asyncio
import httpx
import os

async def test_google_reviews():
    api_key = "AIzaSyDU4AZseLXeygUJaHvdM_RdeAJFm428HvI"
    place_id = "ChIJp9Z92WaZpBIRXDXfhQ37BI8"
    
    url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=reviews,rating,user_ratings_total,url&key={api_key}&language=es"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        print(f"Status: {response.status_code}")
        print(f"Body: {response.text}")

if __name__ == "__main__":
    asyncio.run(test_google_reviews())
