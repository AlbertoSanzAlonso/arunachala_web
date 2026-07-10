from fastapi import APIRouter, Depends, HTTPException, Response, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Content, Activity
from app.api.auth import get_current_user
from google.oauth2 import service_account
from googleapiclient.discovery import build
import os
from datetime import datetime, timedelta
import json

router = APIRouter(prefix="/api/seo", tags=["seo"])

@router.get("/stats")
async def get_search_console_stats(
    days: int = 15,
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Try to load from environment variable first (recommended for production)
    google_auth_json = os.getenv("GOOGLE_AUTH_JSON")
    creds_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "google-credentials.json")
    
    try:
        creds = None
        if google_auth_json:
            try:
                # 1. Try direct JSON
                creds_data = json.loads(google_auth_json)
                print("SEO: Loaded credentials from direct JSON env var")
            except json.JSONDecodeError:
                # 2. Try Hex or Base64 (to avoid quote/newline issues in Docker/Coolify)
                import base64
                import binascii
                import re
                
                clean_env = google_auth_json.strip()
                # Check if it looks like a Hex string
                if re.fullmatch(r'[A-Fa-f0-9]+', clean_env) and len(clean_env) % 2 == 0:
                    try:
                        decoded = binascii.unhexlify(clean_env).decode('utf-8')
                        creds_data = json.loads(decoded)
                        print("SEO: Loaded credentials from Hex env var")
                    except Exception as hexe:
                        print(f"SEO: Failed to decode Hex env var: {hexe}")
                        creds_data = None
                
                if not creds_data:
                    try:
                        # Clean up: keep only valid Base64 characters
                        b64_str = re.sub(r'[^A-Za-z0-9+/=]', '', google_auth_json)
                        
                        # Fix padding
                        padding_needed = len(b64_str) % 4
                        if padding_needed:
                            b64_str += '=' * (4 - padding_needed)
                        
                        decoded = base64.b64decode(b64_str).decode('utf-8')
                        creds_data = json.loads(decoded)
                        print("SEO: Loaded credentials from Base64 env var")
                    except Exception as b64e:
                        print(f"SEO: Failed to decode Base64 env var: {b64e}")
                        creds_data = None

            if creds_data:
                creds = service_account.Credentials.from_service_account_info(
                    creds_data,
                    scopes=['https://www.googleapis.com/auth/webmasters.readonly']
                )

        if not creds and os.path.exists(creds_path):
            # Fallback to file
            creds = service_account.Credentials.from_service_account_file(
                creds_path, 
                scopes=['https://www.googleapis.com/auth/webmasters.readonly']
            )
            print("SEO: Loaded credentials from file")

        if not creds:
            print(f"SEO: No valid credentials found")
            return {
                "status": "not_configured",
                "stats": {"clicks": 0, "impressions": 0, "ctr": 0, "position": 0}
            }

        service = build('searchconsole', 'v1', credentials=creds)

        # Config
        site_url = 'https://www.yogayterapiasarunachala.es/'
        
        # Google has a 2-day delay
        # Google has a 2-day delay
        google_limit_date = (datetime.now() - timedelta(days=2)).strftime('%Y-%m-%d')
        
        # Final dates logic:
        # If user provides explicit dates, use them, but cap end_date to 2 days ago
        if end_date:
            final_end_date = min(end_date, google_limit_date)
        else:
            final_end_date = google_limit_date
            
        if start_date:
            # Ensure start_date is before final_end_date
            final_start_date = min(start_date, (datetime.strptime(final_end_date, '%Y-%m-%d') - timedelta(days=1)).strftime('%Y-%m-%d'))
        else:
            final_start_date = (datetime.now() - timedelta(days=days+2)).strftime('%Y-%m-%d')

        # Query performance
        print(f"SEO: Querying from {final_start_date} to {final_end_date}")
        request = {
            'startDate': final_start_date,
            'endDate': final_end_date,
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

@router.get("/sitemap.xml")
async def sitemap(db: Session = Depends(get_db)):
    """Generates a dynamic sitemap.xml including static pages, blog posts and meditations."""
    
    # Base configuration
    BASE_URL = "https://www.yogayterapiasarunachala.es"
    today = datetime.now().strftime('%Y-%m-%d')
    
    # 1. Define Static Pages
    static_pages = [
        ("/",                           "1.0", "daily"),
        ("/clases-de-yoga/",            "0.9", "weekly"),
        ("/terapias-y-masajes/",        "0.9", "weekly"),
        ("/terapias/masajes/",          "0.9", "weekly"),
        ("/terapias/terapias-holisticas/", "0.9", "weekly"),
        ("/actividades/",               "0.9", "daily"),
        ("/blog/",                      "0.9", "daily"),
        ("/nuestro-espacio/",           "0.8", "weekly"),
        ("/meditaciones/",              "0.9", "weekly"),
        ("/promociones/",               "0.8", "weekly"),
        ("/quienes-somos/",             "0.7", "monthly"),
        ("/contacto/",                  "0.6", "monthly"),
        ("/galeria/clases-de-yoga/",    "0.7", "weekly"),
        ("/galeria/terapias-y-masajes/", "0.7", "weekly"),
        ("/aviso-legal/",               "0.4", "monthly"),
        ("/politica-de-privacidad/",    "0.4", "monthly"),
        ("/sitemap-links.html",        "0.3", "weekly"),
    ]
    
    urls = []
    
    # Add static pages to list
    for path, priority, changefreq in static_pages:
        urls.append(f"""  <url>
    <loc>{BASE_URL}{path}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>{changefreq}</changefreq>
    <priority>{priority}</priority>
  </url>""")
    
    # 2. Get Dynamic Content (Blog & Meditations)
    dynamic_contents = db.query(Content).filter(
        Content.status == "published",
        Content.type.in_(["article", "meditation"]),
        Content.slug.is_not(None),
        ~Content.slug.contains("sugerencia")
    ).all()
    
    for item in dynamic_contents:
        lastmod = (item.updated_at or item.created_at or datetime.now()).strftime('%Y-%m-%d')
        path_prefix = "/blog" if item.type == "article" else "/meditaciones"
        
        # Consistent trailing slash for SEO
        urls.append(f"""  <url>
    <loc>{BASE_URL}{path_prefix}/{item.slug}/</loc>
    <lastmod>{lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>""")
        
    # 3. Get Activities
    activities_list = db.query(Activity).filter(
        Activity.is_active == True,
        Activity.slug.is_not(None),
        ~Activity.slug.contains("sugerencia")
    ).all()
    
    for act in activities_list:
        lastmod = (act.updated_at or act.created_at or datetime.now()).strftime('%Y-%m-%d')
        urls.append(f"""  <url>
    <loc>{BASE_URL}/actividades/?slug={act.slug}</loc>
    <lastmod>{lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>""")

    # Construct final XML
    xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>"""

    return Response(content=xml_content, media_type="application/xml")


@router.get("/html")
async def prerender_html_for_bots(
    path: str = Query(..., description="Ruta pública, p.ej. /blog/mi-articulo/"),
    db: Session = Depends(get_db),
):
    """
    Prerender dinámico: devuelve HTML con el texto del artículo en tiempo real.
    Usado por el middleware de Vercel cuando detecta un bot (Googlebot, etc.).
    """
    from app.services.html_prerender import render_full_page

    if not path.startswith("/"):
        path = f"/{path}"

    html_content = render_full_page(path, db)
    if not html_content:
        raise HTTPException(status_code=404, detail="Ruta no encontrada o sin contenido publicado")

    return Response(
        content=html_content,
        media_type="text/html; charset=utf-8",
        headers={"Cache-Control": "public, max-age=300"},
    )
