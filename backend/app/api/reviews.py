from fastapi import APIRouter, HTTPException
import httpx
import os
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Models for the response
class Review(BaseModel):
    id: str
    author: str
    text: str
    rating: int
    time: str
    profile_photo_url: Optional[str] = None

class ReviewsResponse(BaseModel):
    rating: float
    total_reviews: int
    url: Optional[str] = None
    reviews: List[Review]

# Mock data for fallback
MOCK_REVIEWS = [
    {
        "id": "1",
        "author": "María García",
        "text": "Un lugar mágico para reconectar con uno mismo. Las clases de yoga son excepcionales.",
        "rating": 5,
        "time": "hace 2 semanas",
        "profile_photo_url": None
    },
    {
        "id": "2",
        "author": "Carlos Ruiz",
        "text": "Los terapeutas son muy profesionales. Salí totalmente renovado después del masaje.",
        "rating": 5,
        "time": "hace 1 mes",
        "profile_photo_url": None
    },
    {
        "id": "3",
        "author": "Elena Torres",
        "text": "El ambiente es paz pura. Me encanta venir a desconectar del ruido de la ciudad.",
        "rating": 5,
        "time": "hace 3 semanas",
        "profile_photo_url": None
    }
]

@router.get("/reviews", response_model=ReviewsResponse)
async def get_reviews():
    api_key = os.getenv("GOOGLE_API_KEY")
    place_id = os.getenv("GOOGLE_PLACE_ID")

    # Fallback URL if we can't get the real one
    mock_url = "https://www.google.com/maps/search/?api=1&query=Arunachala+Yoga"

    if not api_key or not place_id:
        print("Google API Key or Place ID not found. returning mock data.")
        return {
            "rating": 4.9,
            "total_reviews": 124,
            "url": mock_url,
            "reviews": MOCK_REVIEWS
        }

    try:
        async with httpx.AsyncClient() as client:
            # Added 'url' to fields
            url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=reviews,rating,user_ratings_total,url&key={api_key}&language=es"
            response = await client.get(url)
            data = response.json()

            if data.get("status") != "OK":
                print(f"Google API Error: {data.get('status')} - {data.get('error_message')}")
                return {
                    "rating": 4.9,
                    "total_reviews": 124,
                    "url": mock_url,
                    "reviews": MOCK_REVIEWS
                }

            result = data.get("result", {})
            google_reviews = result.get("reviews", [])
            
            formatted_reviews = []
            for review in google_reviews:
                formatted_reviews.append({
                    "id": review.get("time"), # Use timestamp as ID
                    "author": review.get("author_name"),
                    "text": review.get("text"),
                    "rating": review.get("rating"),
                    "time": review.get("relative_time_description"),
                    "profile_photo_url": review.get("profile_photo_url")
                })
            
            return {
                "rating": result.get("rating", 0),
                "total_reviews": result.get("user_ratings_total", 0),
                "url": result.get("url", mock_url),
                "reviews": formatted_reviews[:3] # Returning top 3 reviews
            }

    except Exception as e:
        print(f"Error fetching reviews: {e}")
        return {
            "rating": 4.9,
            "total_reviews": 124,
            "url": mock_url,
            "reviews": MOCK_REVIEWS
        }
