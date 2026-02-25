from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from google.oauth2 import service_account
from googleapiclient.discovery import build
import os
from datetime import datetime, timedelta
import json

router = APIRouter(prefix="/api/seo", tags=["seo"])

@router.get("/stats")
async def get_search_console_stats(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Fetch search performance data from Google Search Console"""
    # Try to load from environment variable first (recommended for production)
    google_auth_json = os.getenv("GOOGLE_AUTH_JSON")
    creds_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "google-credentials.json")
    
    try:
        if google_auth_json:
            # Load from environment variable
            creds_data = json.loads(google_auth_json)
            creds = service_account.Credentials.from_service_account_info(
                creds_data,
                scopes=['https://www.googleapis.com/auth/webmasters.readonly']
            )
            print("SEO: Loaded credentials from environment variable")
        elif os.path.exists(creds_path):
            # Fallback to file
            creds = service_account.Credentials.from_service_account_file(
                creds_path, 
                scopes=['https://www.googleapis.com/auth/webmasters.readonly']
            )
            print("SEO: Loaded credentials from file")
        else:
            print(f"SEO: No credentials found at {creds_path} and no GOOGLE_AUTH_JSON env var")
            return {
                "status": "not_configured",
                "stats": {"clicks": 0, "impressions": 0, "ctr": 0, "position": 0}
            }

        service = build('searchconsole', 'v1', credentials=creds)

        # Config
        site_url = 'https://www.yogayterapiasarunachala.es/'
        end_date = (datetime.now() - timedelta(days=2)).strftime('%Y-%m-%d') # Google has a 2-day delay
        start_date = (datetime.now() - timedelta(days=days+2)).strftime('%Y-%m-%d')

        # Query performance
        request = {
            'startDate': start_date,
            'endDate': end_date,
            'dimensions': ['date']
        }
        
        response = service.searchanalytics().query(siteUrl=site_url, body=request).execute()
        
        rows = response.get('rows', [])
        
        if not rows:
            return {
                "status": "no_data",
                "stats": {
                    "clicks": 0,
                    "impressions": 0,
                    "ctr": 0,
                    "position": 0
                },
                "history": []
            }

        # Calculate totals
        total_clicks = sum(row['clicks'] for row in rows)
        total_impressions = sum(row['impressions'] for row in rows)
        avg_ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
        avg_pos = sum(row['position'] for row in rows) / len(rows) if rows else 0

        # Format history for charts
        history = [
            {
                "date": row['keys'][0],
                "clicks": row['clicks'],
                "impressions": row['impressions']
            } for row in rows
        ]

        return {
            "status": "success",
            "stats": {
                "clicks": total_clicks,
                "impressions": total_impressions,
                "ctr": round(avg_ctr, 2),
                "position": round(avg_pos, 1)
            },
            "history": history
        }

    except Exception as e:
        print(f"Error fetching Search Console data: {e}")
        # Could be authorization error or missing property in SC
        return {
            "status": "error",
            "message": str(e),
            "stats": {
                "clicks": 0,
                "impressions": 0,
                "ctr": 0,
                "position": 0
            }
        }
