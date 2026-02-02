import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv("backend/.env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
XAI_API_KEY = os.getenv("XAI_API_KEY")

print(f"OpenAI Key: {OPENAI_API_KEY[:10]}...")
print(f"XAI Key: {XAI_API_KEY[:10]}...")

try:
    client = OpenAI(api_key=OPENAI_API_KEY)
    print("Testing OpenAI Embedding...")
    client.embeddings.create(input=["test"], model="text-embedding-3-small")
    print("OpenAI Embedding: OK")
except Exception as e:
    print(f"OpenAI Embedding: FAILED - {e}")

try:
    xai_client = OpenAI(
        api_key=XAI_API_KEY,
        base_url="https://api.x.ai/v1"
    )
    print("Testing Grok Chat...")
    res = xai_client.chat.completions.create(
        model="grok-2-1212",
        messages=[{"role": "user", "content": "hi"}]
    )
    print(f"Grok Chat: OK - {res.choices[0].message.content}")
except Exception as e:
    print(f"Grok Chat: FAILED - {e}")
