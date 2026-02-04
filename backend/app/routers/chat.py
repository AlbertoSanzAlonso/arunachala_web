from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import text
from pydantic import BaseModel
from typing import List, Optional
import os
from qdrant_client import QdrantClient
from qdrant_client.http import models
from openai import OpenAI

# Initialize Router
router = APIRouter()

from groq import Groq
import google.generativeai as genai
from sqlalchemy.orm import Session
from app.core.database import get_db, engine
from app.api.auth import get_current_user
from app.models.models import (
    AgentConfig, User, YogaClassDefinition, 
    MassageType, TherapyType, Content, Activity,
    RAGSyncLog
)

# --- Configurations ---
QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", 6333))
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") 
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
COLLECTION_NAME = "arunachala_knowledge_base"

# --- Clients ---
try:
    if QDRANT_URL and QDRANT_API_KEY:
        qdrant_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    else:
        qdrant_client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)
except Exception as e:
    print(f"Warning: Could not connect to Qdrant: {e}")
    qdrant_client = None

# Providers
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-1.5-flash')
else:
    gemini_model = None


# --- Data Models ---

class ChatMessage(BaseModel):
    role: str # 'user' or 'assistant' or 'system'
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    stream: bool = False

class ChatResponse(BaseModel):
    response: str
    sources: Optional[List[str]] = None

class ResetRequest(BaseModel):
    scope: str  # 'all', 'yoga_class', 'massage', 'therapy', 'content'


# --- Helper Functions ---

def get_embedding(text: str):
    """Generate embedding for query text using OpenAI."""
    if not openai_client:
        raise HTTPException(status_code=500, detail="OpenAI API Key not configured")
    
    text = text.replace("\n", " ")
    return openai_client.embeddings.create(input=[text], model="text-embedding-3-small").data[0].embedding

def search_knowledge_base(query: str, limit: int = 3):
    """Search Qdrant for relevant context."""
    if not qdrant_client:
        return []
    
    try:
        # Check if collection exists first to avoid errors on fresh start
        collections = qdrant_client.get_collections()
        exists = any(c.name == COLLECTION_NAME for c in collections.collections)
        if not exists:
            return []

        query_vector = get_embedding(query)
        
        search_result = qdrant_client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            limit=limit
        ).points
        return search_result
    except Exception as e:
        print(f"Error searching Qdrant: {e}")
        return []

def format_context(search_results):
    """Format the retrieved documents into a string context."""
    if not search_results:
        return ""
    
    context = "\n\n".join([
        f"--- Información Relevante (Fuente: {res.payload.get('source', 'Web')}) ---\n{res.payload.get('content', '')}"
        for res in search_results
    ])
    return context


# --- Endpoints ---

@router.get("/config")
def get_agent_config(db: Session = Depends(get_db)):
    config = db.query(AgentConfig).first()
    if not config:
        config = AgentConfig(
            tone="Asistente Amable",
            response_length="balanced",
            emoji_style="moderate",
            focus_area="info",
            system_instructions=""
        )
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

class AgentConfigUpdate(BaseModel):
    tone: str
    response_length: str
    emoji_style: str
    focus_area: str
    system_instructions: Optional[str] = None
    is_active: bool

@router.post("/config")
def update_agent_config(config_data: AgentConfigUpdate, db: Session = Depends(get_db)):
    config = db.query(AgentConfig).first()
    if not config:
        config = AgentConfig()
        db.add(config)
    
    config.tone = config_data.tone
    config.response_length = config_data.response_length
    config.emoji_style = config_data.emoji_style
    config.focus_area = config_data.focus_area
    config.system_instructions = config_data.system_instructions
    config.is_active = config_data.is_active
    
    db.commit()
    db.refresh(config)
    return config

from fastapi.responses import StreamingResponse
import json
import asyncio

@router.post("/chat")
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Endpoint principal del Chatbot RAG con soporte para Streaming.
    """
    if not openai_client and not groq_client and not gemini_model:
        return ChatResponse(response="Lo siento, no hay ningún proveedor de IA configurado.")
        
    # Get configuration
    config = db.query(AgentConfig).first()
    
    # Defaults
    tone = config.tone if config else "Asistente Amable"
    length = config.response_length if config else "balanced"
    emoji = config.emoji_style if config else "moderate"
    focus = config.focus_area if config else "info"
    extra_instructions = config.system_instructions if config and config.system_instructions else ""

    # Map configs to natural language prompts
    length_instruction = {
        "concise": "Tus respuestas deben ser breves, directas y al grano (máximo 2-3 frases).",
        "balanced": "Tus respuestas deben ser equilibradas, ni muy cortas ni muy largas.",
        "detailed": "Tus respuestas deben ser explicativas, detalladas y ricas en información."
    }.get(length, "")

    emoji_instruction = {
        "none": "NO uses ningún emoji en tu respuesta. Solo texto plano.",
        "moderate": "Usa uno o dos emojis como máximo para dar calidez.",
        "high": "Usa emojis de forma alegre y frecuente para decorar tu mensaje."
    }.get(emoji, "")

    # Focus area logic (multi-select)
    focus_list = focus.split(',') if focus else []
    focus_instruction_parts = []
    
    mapping = {
        "info": "INFORMAR y resolver dudas con precisión.",
        "booking": "PERSUADIR al usuario para que reserve una clase o terapia.",
        "coaching": "Actuar como un COACH de bienestar, dando consejos y motivando."
    }
    
    for f in focus_list:
        clean_f = f.strip()
        if clean_f in mapping:
            focus_instruction_parts.append(mapping[clean_f])
        else:
            focus_instruction_parts.append(f"Centrarse en: {clean_f}")
            
    focus_instruction = "Tus objetivos son: " + " Y TAMBIÉN ".join(focus_instruction_parts) + "."

    # 1. Get user query
    user_query = request.messages[-1].content
    
    # 2. Retrieve Context (RAG)
    retrieved_docs = search_knowledge_base(user_query)
    context_text = format_context(retrieved_docs)
    sources = list(set([doc.payload.get('source', 'unknown') for doc in retrieved_docs])) if retrieved_docs else []
    
    # 3. Construct System Prompt
    system_prompt = f"""Eres Arunachala Bot, el asistente virtual del centro de Yoga y Terapias 'Arunachala' en Cornellà.
    
PERSONALIDAD Y ESTILO:
- Tono: {tone}. (Namasté 🙏).
- Longitud: {length_instruction}
- Emojis: {emoji_instruction}
- Objetivo: {focus_instruction}

INSTRUCCIONES EXTRA DEL ADMINISTRADOR:
{extra_instructions}

CONTEXTO DE LA WEB:
{context_text}

Usa la INFO DE CONTEXTO para responder. Si no sabes algo, sé honesto y sugiere contactar.
Si el contexto está vacío, responde amablemente sobre yoga.
Si mencionas horarios o precios, sé preciso basándote en el contexto.
"""

    # 4. Prepare messages
    api_messages = [{"role": "system", "content": system_prompt}]
    for msg in request.messages[-5:]: 
        api_messages.append({"role": msg.role, "content": msg.content})

    # 5. Handle Streaming or Static Response
    if request.stream:
        async def stream_generator():
            try:
                # Meta-data first (sources)
                yield f"data: {json.dumps({'sources': sources})}\n\n"
                
                if groq_client:
                    stream = groq_client.chat.completions.create(
                        model="llama-3.3-70b-versatile",
                        messages=api_messages,
                        temperature=0.7,
                        stream=True
                    )
                    for chunk in stream:
                        if chunk.choices[0].delta.content:
                            yield f"data: {json.dumps({'content': chunk.choices[0].delta.content})}\n\n"
                
                elif gemini_model:
                    # Gemini streaming is slightly different
                    prompt = "\n".join([f"{m['role']}: {m['content']}" for m in api_messages])
                    response = gemini_model.generate_content(prompt, stream=True)
                    for chunk in response:
                        if chunk.text:
                            yield f"data: {json.dumps({'content': chunk.text})}\n\n"

                elif openai_client:
                    stream = openai_client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=api_messages,
                        temperature=0.7,
                        stream=True
                    )
                    for chunk in stream:
                        if chunk.choices and chunk.choices[0].delta.content:
                            yield f"data: {json.dumps({'content': chunk.choices[0].delta.content})}\n\n"
                
                yield "data: [DONE]\n\n"
            except Exception as e:
                print(f"Streaming Error: {e}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return StreamingResponse(stream_generator(), media_type="text/event-stream")

    else:
        # Non-streaming response
        try:
            if groq_client:
                completion = groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=api_messages,
                    temperature=0.7
                )
                ai_response = completion.choices[0].message.content
            elif gemini_model:
                prompt = "\n".join([f"{m['role']}: {m['content']}" for m in api_messages])
                response = gemini_model.generate_content(prompt)
                ai_response = response.text
            elif openai_client:
                completion = openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=api_messages,
                    temperature=0.7
                )
                ai_response = completion.choices[0].message.content
            else:
                raise HTTPException(status_code=500, detail="No AI provider configured")
            
            return ChatResponse(response=ai_response, sources=sources)
        except Exception as e:
            print(f"Error calling AI: {e}")
            raise HTTPException(status_code=500, detail=f"Error generating AI response: {str(e)}")



@router.post("/ingest")
async def ingest_data(secret: str, content: str, source: str):
    """
    Endpoint simple para poblar manualmente la base de datos (para usar desde n8n o script).
    Requiere un 'secret' básico por seguridad.
    """
    if secret != os.getenv("ADMIN_SECRET", "admin123"):
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    if not qdrant_client or not openai_client:
        raise HTTPException(status_code=503, detail="Services not configured")

    # Ensure collection exists
    try:
        collections = qdrant_client.get_collections()
        if not any(c.name == COLLECTION_NAME for c in collections.collections):
            qdrant_client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=models.VectorParams(size=1536, distance=models.Distance.COSINE)
            )
    except Exception as e:
        print(f"Error checking/creating collection: {e}")

    # Generate vector
    vector = get_embedding(content)
    
    # ID generation (simple hash or uuid)
    import uuid
    point_id = str(uuid.uuid4())

    # Upsert
    qdrant_client.upsert(
        collection_name=COLLECTION_NAME,
        points=[
            models.PointStruct(
                id=point_id,
                vector=vector,
                payload={"content": content, "source": source}
            )
        ]
    )
    
    return {"status": "success", "id": point_id}

@router.post("/chat-memory-reset")
async def reset_rag_memory(
    request: ResetRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Resets the RAG memory in Qdrant based on the provided scope.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    print(f"\n--- 🛠️ DEBUG RESET START: scope={request.scope} ---")
    if not qdrant_client:
        print("❌ Qdrant client not available")
        raise HTTPException(status_code=503, detail="Qdrant service not available")

    try:
        if request.scope == "all":
            print(f"🚀 Starting TOTAL RAG Reset")
            # Recreate the entire collection
            try:
                print(f"  - Deleting Qdrant collection: {COLLECTION_NAME}")
                qdrant_client.delete_collection(COLLECTION_NAME)
            except Exception as q_err:
                print(f"  - Collection delete warning: {q_err}")
            
            print(f"  - Creating fresh Qdrant collection")
            qdrant_client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=models.VectorParams(size=1536, distance=models.Distance.COSINE)
            )
            
            # Reset tracking in DB using a direct connection for maximum reliability
            print(f"  - Opening direct connection for SQL Reset")
            with engine.connect() as conn:
                with conn.begin():
                    tables = ['yoga_classes', 'massage_types', 'therapy_types', 'contents', 'activities']
                    for table in tables:
                        print(f"    * Executing UPDATE on {table}")
                        res = conn.execute(text(f"UPDATE {table} SET vector_id = NULL, vectorized_at = NULL, needs_reindex = TRUE"))
                        print(f"    * Result for {table}: {res.rowcount} rows affected.")
                    
                    # Cancel all active logs
                    print(f"  - Cancelling active sync logs")
                    res_logs = conn.execute(text("UPDATE rag_sync_log SET status = 'failed', error_message = 'Cancelado por reinicio de memoria' WHERE status IN ('pending', 'processing')"))
                    print(f"    * Result for logs: {res_logs.rowcount} logs cancelled.")
            
            print(f"✅ Total RAG Reset Completed Successfully")
        else:
            # Partial Reset
            print(f"🚀 Starting PARTIAL RAG Reset (scope={request.scope})")
            qdrant_client.delete(
                collection_name=COLLECTION_NAME,
                points_selector=models.FilterSelector(
                    filter=models.Filter(
                        must=[
                            models.FieldCondition(
                                key="type",
                                match=models.MatchValue(value=request.scope)
                            )
                        ]
                    )
                )
            )
            
            # Reset tracking in DB for specific table
            table_map = {
                'yoga_class': 'yoga_classes',
                'massage': 'massage_types',
                'therapy': 'therapy_types',
                'content': 'contents',
                'activity': 'activities'
            }
            
            target_table = table_map.get(request.scope)
            if target_table:
                print(f"  - Resetting table: {target_table}")
                with engine.connect() as conn:
                    with conn.begin():
                        res = conn.execute(text(f"UPDATE {target_table} SET vector_id = NULL, vectorized_at = NULL, needs_reindex = TRUE"))
                        print(f"    * Result for {target_table}: {res.rowcount} rows affected.")
                        
                        # Cancel active logs for this specific type
                        webhook_type = request.scope if request.scope != 'yoga_class' else 'yoga_class'
                        res_logs = conn.execute(text("UPDATE rag_sync_log SET status = 'failed', error_message = 'Cancelado por reinicio parcial' WHERE status IN ('pending', 'processing') AND entity_type = :t"), {"t": webhook_type})
                        print(f"    * Result for logs ({webhook_type}): {res_logs.rowcount} logs cancelled.")
            else:
                print(f"  - No table mapping found for scope: {request.scope}")
        
        print(f"🏁 🏁 🏁 DEBUG RESET ENDED SUCCESSFUL\n")
        return {"status": "success", "message": f"Memory and Database for {request.scope} reset successfully"}

    except Exception as e:
        print(f"❌ ❌ ❌ Error resetting RAG memory: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
