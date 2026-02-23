import asyncio
import os
from dotenv import load_dotenv
load_dotenv(".env")
from app.core.translation_utils import translate_content

async def run():
    res = await translate_content({"name": "Gghfhgf"})
    print("RES:", res)

asyncio.run(run())
