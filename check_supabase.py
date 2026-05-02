
import sys
import os
from pydantic_settings import BaseSettings
from typing import Optional, Union
from sqlalchemy import create_engine, text

# Force loading the correct .env
from dotenv import load_dotenv
load_dotenv('backend/.env')

sys.path.append(os.path.join(os.getcwd(), 'backend'))
from app.core.config import settings

print(f"Connecting to: {settings.DATABASE_URL.split('@')[-1]}")
engine = create_engine(settings.DATABASE_URL)

try:
    with engine.connect() as conn:
        res = conn.execute(text("SELECT id, title, updated_at, translations FROM contents WHERE title ILIKE '%Contractura%' OR body ILIKE '%Contractura%'"))
        rows = res.fetchall()
        if not rows:
            print("No article found with 'Contractura'")
        for r in rows:
            print(f"ID: {r[0]} | Title: {r[1]} | Updated: {r[2]}")
            trans = r[3] or {}
            print(f"Translations keys: {list(trans.keys())}")
            if 'en' in trans:
                print(f"EN Title: {trans['en'].get('title', 'N/A')}")
except Exception as e:
    print(f"Error: {e}")
