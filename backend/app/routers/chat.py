from fastapi import APIRouter, HTTPException, Depends
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
from app.models.models import (
    AgentConfig, User, Content, YogaClassDefinition, 
    MassageType, TherapyType, Activity
)
from app.core.database import get_db
from app.api.auth import get_current_user

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
    language: str = "es"  # Nuevo campo: idioma del usuario

class ChatResponse(BaseModel):
    response: str
    sources: Optional[List[str]] = None # Deprecated but kept for compatibility

class ResetRequest(BaseModel):
    scope: str  # 'all', 'yoga_class', 'massage', 'therapy', 'content'


# --- Helper Functions ---

def get_embedding(text: str):
    """Generate embedding for query text using OpenAI."""
    if not openai_client:
        raise HTTPException(status_code=500, detail="OpenAI API Key not configured")
    
    text = text.replace("\n", " ")
    return openai_client.embeddings.create(input=[text], model="text-embedding-3-small").data[0].embedding

def search_knowledge_base(query: str, limit: int = 10):
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
            limit=limit  # Increased limit for better context
        ).points
        return search_result
    except Exception as e:
        print(f"Error searching Qdrant: {e}")
        return []

def get_inventory_summary(db: Session):
    """Get counts of items in the database to inform the bot about total offerings."""
    try:
        def count_active(Model, entity_type=None):
            query = db.query(Model)
            if hasattr(Model, 'is_active'):
                query = query.filter(Model.is_active == True)
            elif hasattr(Model, 'status'):
                query = query.filter(Model.status == 'published')
            
            if entity_type and hasattr(Model, 'type'):
                query = query.filter(Model.type == entity_type)
            return query.count()

        # Explicit count for meditations to ensure accuracy
        meditations_count = db.query(Content).filter(Content.type == 'meditation', Content.status == 'published').count()

        summary = {
            "yoga": count_active(YogaClassDefinition),
            "massage": count_active(MassageType),
            "therapy": count_active(TherapyType),
            "articles": count_active(Content, 'article'),
            "meditations": meditations_count,
            "activities": count_active(Activity)
        }
        
        def get_samples(Model, entity_type=None, limit=5):
            query = db.query(Model)
            if hasattr(Model, 'is_active'):
                query = query.filter(Model.is_active == True)
            elif hasattr(Model, 'status'):
                query = query.filter(Model.status == 'published')
            if entity_type and hasattr(Model, 'type'):
                query = query.filter(Model.type == entity_type)
            
            items = query.limit(limit).all()
            if not items: return ""
            titles = []
            for item in items:
                t = getattr(item, 'title', None) or getattr(item, 'name', None)
                if t: titles.append(t)
            return " (ejemplos: " + ", ".join(titles) + "...)" if titles else ""

        parts = []
        if summary['yoga']: parts.append(f"{summary['yoga']} clases de yoga{get_samples(YogaClassDefinition)}")
        if summary['massage']: parts.append(f"{summary['massage']} tipos de masajes{get_samples(MassageType)}")
        if summary['therapy']: parts.append(f"{summary['therapy']} terapias{get_samples(TherapyType)}")
        if summary['articles']: parts.append(f"{summary['articles']} artículos en el blog{get_samples(Content, 'article')}")
        if summary['meditations']: parts.append(f"{summary['meditations']} meditaciones guiadas{get_samples(Content, 'meditation', limit=10)}")
        if summary['activities']: parts.append(f"{summary['activities']} actividades{get_samples(Activity)}")
        
        return "Actualmente ofrecemos: " + "; ".join(parts) + "."

    except Exception as e:
        print(f"Error getting inventory summary: {e}")
        return ""

def format_context(search_results):
    """Format the retrieved documents into a string context."""
    if not search_results:
        return ""
    
    context_parts = []
    for res in search_results:
        payload = res.payload
        meta = payload.get('metadata', {})
        
        # Try to find title in root payload, then in metadata dict (title or name)
        title = payload.get('title') or meta.get('title') or meta.get('name') or 'Sin Título'
        
        # Try to find content
        content = payload.get('content', '')
        # Fallback to description if content is empty
        if not content:
            content = payload.get('description') or meta.get('description', '')
            
        # Try to find source
        source = payload.get('source') or meta.get('source') or 'Base de Conocimiento Interna'
        
        # Try to find type
        type_ = payload.get('type') or meta.get('type') or 'general'

        # Try to find tags
        tags = payload.get('tags') or meta.get('tags') or ''
        tags_str = f"ETIQUETAS: {tags}\n" if tags else ""
        
        context_parts.append(f"""
--- DOCUMENTO ENCONTRADO ({type_}) ---
TÍTULO: {title}
{tags_str}CONTENIDO O DESCRIPCIÓN:
{content}
--------------------------------------
""")
    
    return "\n".join(context_parts)


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
    
    # 2. Retrieve Context (RAG) and Inventory
    inventory_summary = get_inventory_summary(db)
    print(f"🌍 DEBUG INVENTORY: {inventory_summary}")
    retrieved_docs = search_knowledge_base(user_query)
    context_text = format_context(retrieved_docs)
    sources = list(set([doc.payload.get('source', 'unknown') for doc in retrieved_docs])) if retrieved_docs else []
    
    # 3. Construct System Prompt
    # Map language codes
    lang_map = {
        "es": "Español",
        "en": "English",
        "ca": "Català (Catalán)",
        "fr": "Français",
        "de": "Deutsch"
    }
    target_lang = lang_map.get(request.language[:2], "Español")
    print(f"🌍 DEBUG LANG: Request='{request.language}' -> Target='{target_lang}'")

    # 3. Construct System Prompt
    system_prompt = f"""Eres Arunachala Bot, el asistente virtual del centro de Yoga y Terapias 'Arunachala' en Cornellà.

INFORMACIÓN CRÍTICA DE INVENTARIO (Usa esto para responder sobre cantidades):
{inventory_summary}
(IMPORTANTE: Tienes exactamente estas cantidades en tu base de datos. Si el usuario pregunta "cuántos hay", recurre a esta sección. NO te inventes cifras basadas en los fragmentos de abajo si contradicen esta sección).
    
IDIOMA DE RESPUESTA:
 - **Debes responder SIEMPRE en {target_lang}**.
 - Si el usuario habla en {target_lang}, TODA tu respuesta (y las citas del contexto) deben ser en {target_lang}. TRADUCE cualquier información recuperada si está en otro idioma.
 - Saluda usando un saludo apropiado en {target_lang} (ej: 'Namasté' es universal, pero el resto en {target_lang}).
    
PERSONALIDAD Y ESTILO:
- Tono: {tone}.
- Longitud: {length_instruction}
- Emojis: {emoji_instruction}
- Objetivo: {focus_instruction}

INSTRUCCIONES EXTRA DEL ADMINISTRADOR (ATENCIÓN: Si estas instrucciones incluyen frases o saludos en español, TRADÚCELAS al {target_lang} antes de usarlas):
{extra_instructions}

CONTEXTO DETALLADO (Fragmentos de la web):
{context_text}

 INSTRUCCIONES DE USO DE CONTEXTO:
 - Usa la información del CONTEXTO DE LA WEB para responder las dudas del usuario.
 - **IMPORTANTE**: Si el contexto está en español y {target_lang} es otro idioma, TRADÚCELO sobre la marcha. 
 - **CITAS TEXTUALES**: Si el usuario pide "la primera línea" o una cita, y el original es español, TRADUCE LA CITA al {target_lang}. No cites en español.
 - NUNCA respondas con fragmentos en español si el usuario habla en otro idioma (salvo nombres propios o términos sánscritos).
 - NO menciones las fuentes ni cites documentos explícitamente (ej: "Según el documento X..."). Integra la información de forma natural en tu respuesta.
 - Si no sabes la respuesta basada en el contexto, puedes usar tu conocimiento general sobre yoga/bienestar, pero prioriza el contexto del centro.
 - Si mencionas horarios o precios, sé preciso basándote únicamente en el contexto provisto.

EJEMPLOS DE COMPORTAMIENTO ESPERADO (User Language != Context Language):
---------------------------------------------------------------------
Caso 1: Usuario pregunta en Inglés, Contexto en Español.
User: "What is the price?"
Context: "El precio es 10 euros."
Assistant Correcto: "The price is 10 euros." 
Assistant INCORRECTO: "The price is '10 euros' (El precio es 10 euros)." (NO MOSTRAR EL ORIGINAL)

Caso 2: Usuario pide CITA TEXTUAL en Inglés.
User: "What is the first line?"
Context: "En un lugar de la Mancha..."
Assistant Correcto: "The first line is: 'In a place of La Mancha...'" (SOLO TRADUCCIÓN)
Assistant INCORRECTO: "The first line is: 'En un lugar de la Mancha...'" (PROHIBIDO CITAR EN IDIOMA INCORRECTO)
Assistant INCORRECTO: "'En un lugar de la Mancha...' which means 'In a place...'" (NO MOSTRAR AMBOS)

Caso 3: Despedida Ritual / Instrucción Admin.
Instruction: "Termina con: 'Que el sol te ilumine'."
Assistant Correcto: "May the sun illuminate you." (SOLO TRADUCCIÓN)
Assistant INCORRECTO: "May the sun illuminate you. Que el sol te ilumine." (NO DUPLICAR)
---------------------------------------------------------------------

--- DIRECTRIZ SUPREMA DE IDIOMA ({target_lang}) ---
1. EL IDIOMA DEL USUARIO ES: {target_lang}.
2. TU RESPUESTA DEBE SER 100% EN {target_lang}.
3. **PROHIBIDO** INCLUIR TEXTO EN ESPAÑOL (ni siquiera entre paréntesis o comillas). SIEMPRE TRADUCE TODO.
4. Si las instrucciones del administrador o el contexto contienen frases en español, TRADÚCELAS INVISIBLEMENTE y muestra solo el resultado en {target_lang}.
5. SI LA DESPEDIDA RITUAL ESTÁ EN ESPAÑOL, TRADÚCELA O ELIMÍNALA. (Ej: NO DIGAS "Que el sol...", DI "May the sun...").
"""

    # 4. Prepare messages
    api_messages = [{"role": "system", "content": system_prompt}]
    for msg in request.messages[-5:]: 
        api_messages.append({"role": msg.role, "content": msg.content})

    # 5. Handle Streaming or Static Response
    if request.stream:
        async def stream_generator():
            try:
                # Meta-data first (empty sources to hide them)
                yield f"data: {json.dumps({'sources': []})}\n\n"
                
                # Priority: OpenAI -> Gemini -> Groq
                if openai_client:
                    stream = openai_client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=api_messages,
                        temperature=0.7,
                        stream=True
                    )
                    for chunk in stream:
                        if chunk.choices and chunk.choices[0].delta.content:
                            yield f"data: {json.dumps({'content': chunk.choices[0].delta.content})}\n\n"

                elif gemini_model:
                    # Gemini streaming is slightly different
                    prompt = "\n".join([f"{m['role']}: {m['content']}" for m in api_messages])
                    response = gemini_model.generate_content(prompt, stream=True)
                    for chunk in response:
                        if chunk.text:
                            yield f"data: {json.dumps({'content': chunk.text})}\n\n"

                elif groq_client:
                    stream = groq_client.chat.completions.create(
                        model="llama-3.3-70b-versatile",
                        messages=api_messages,
                        temperature=0.7,
                        stream=True
                    )
                    for chunk in stream:
                        if chunk.choices[0].delta.content:
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
            
            return ChatResponse(response=ai_response, sources=[])
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
    current_user: User = Depends(get_current_user)
):
    """
    Resets the RAG memory in Qdrant based on the provided scope.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if not qdrant_client:
        raise HTTPException(status_code=503, detail="Qdrant service not available")

    try:
        if request.scope == "all":
            # Recreate the entire collection
            try:
                qdrant_client.delete_collection(COLLECTION_NAME)
            except:
                pass
            qdrant_client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=models.VectorParams(size=1536, distance=models.Distance.COSINE)
            )
        else:
            # Delete points by type filter
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
        
        return {"status": "success", "message": f"Memory for {request.scope} reset successfully"}
    except Exception as e:
        print(f"Error resetting RAG memory: {e}")
        raise HTTPException(status_code=500, detail=str(e))
