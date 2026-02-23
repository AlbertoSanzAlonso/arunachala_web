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
    text: Optional[str] = ""
    rating: int
    time: Optional[str] = ""
    profile_photo_url: Optional[str] = None

class ReviewsResponse(BaseModel):
    rating: float
    total_reviews: int
    url: Optional[str] = None
    reviews: List[Review]

# Mock data for fallback (Empty until API is configured)
MOCK_REVIEWS = []

@router.get("/reviews", response_model=ReviewsResponse)
async def get_reviews():
    api_key = os.getenv("GOOGLE_API_KEY")
    place_id = os.getenv("GOOGLE_PLACE_ID")

    # Fallback URL if we can't get the real one
    mock_url = "https://www.google.com/maps/search/?api=1&query=Arunachala+Yoga"

    if not api_key or not place_id:
        print("Google API Key or Place ID not found. returning empty state.")
        return {
            "rating": 0,
            "total_reviews": 0,
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
                    "rating": 0,
                    "total_reviews": 0,
                    "url": mock_url,
                    "reviews": MOCK_REVIEWS
                }

            result = data.get("result", {})
            google_reviews = result.get("reviews", [])
            
            formatted_reviews = []
            for review in google_reviews:
                formatted_item = {
                    "id": str(review.get("time", "")),
                    "author": review.get("author_name", "Anónimo"),
                    "text": review.get("text", ""),
                    "rating": review.get("rating", 5),
                    "time": review.get("relative_time_description", ""),
                    "profile_photo_url": review.get("profile_photo_url")
                }
                formatted_reviews.append(formatted_item)
            
            print(f"DEBUG: Returning {len(formatted_reviews)} reviews. First ID type: {type(formatted_reviews[0]['id'])}")
            
            return {
                "rating": result.get("rating", 0),
                "total_reviews": result.get("user_ratings_total", 0),
                "url": result.get("url", mock_url),
                "reviews": formatted_reviews[:3] # Returning top 3 reviews
            }

    except Exception as e:
        print(f"Error fetching reviews: {e}")
        return {
            "rating": 0,
            "total_reviews": 0,
            "url": mock_url,
            "reviews": MOCK_REVIEWS
        }
