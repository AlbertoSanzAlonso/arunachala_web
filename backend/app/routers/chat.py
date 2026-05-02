from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import os
from qdrant_client import QdrantClient
from qdrant_client.http import models
from openai import OpenAI
from app.core.redis_cache import cache, key_inventory, key_agent_config, TTL_INVENTORY, TTL_CONFIG

# Initialize Router
router = APIRouter()

from groq import Groq
import google.generativeai as genai
import json, re
from sqlalchemy.orm import Session
from app.models.models import (
    AgentConfig, User, Content, YogaClassDefinition, 
    MassageType, TherapyType, Activity, Promotion
)
from app.core.database import get_db
from app.api.auth import get_current_user

# --- Configurations ---
QDRANT_HOST = os.getenv("QDRANT_HOST", "qdrant-ai")
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
        # Try various hosts: qdrant-ai, qdrant, and finally localhost
        connected = False
        fallback_hosts = [QDRANT_HOST, "qdrant", "localhost"]
        
        for host in fallback_hosts:
            try:
                print(f"📡 Attempting to connect to Qdrant at {host}:{QDRANT_PORT}...")
                qdrant_client = QdrantClient(host=host, port=QDRANT_PORT, timeout=2)
                qdrant_client.get_collections()
                print(f"✅ Connected to Qdrant at {host}")
                connected = True
                break
            except Exception as e:
                print(f"❌ Failed to connect to {host}: {e}")
        
        if not connected:
            print("⚠️ Warning: Could not connect to any Qdrant instance.")
            qdrant_client = None
except Exception as e:
    print(f"Warning: Could not connect to any Qdrant instance: {e}")
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
    language: str = "es"
    is_quiz: bool = False  # Para identificar si viene del cuestionario de bienestar

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

def search_knowledge_base(query: str, limit: int = 3):
    """Search Qdrant for relevant context with score threshold filtering."""
    if not qdrant_client:
        return []
    
    try:
        # Check if collection exists first to avoid errors on fresh start
        collections = qdrant_client.get_collections()
        exists = any(c.name == COLLECTION_NAME for c in collections.collections)
        if not exists:
            return []

        query_vector = get_embedding(query)
        
        # Retrieve up to `limit` docs, but only those with score >= 0.40
        search_result = qdrant_client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            limit=limit,
            score_threshold=0.40  # Lowered from 0.50 to better catch Monday/Tuesday questions
        ).points
        
        # Secondary filter: discard vectors with no meaningful content
        filtered = []
        for p in search_result:
            p_content = p.payload.get("content") or p.payload.get("chunk_text") or ""
            if (p_content.strip() 
                and "Sin contenido" not in p_content 
                and len(p_content.strip()) > 40):
                filtered.append(p)
        
        print(f"🔍 RAG: {len(search_result)} retrieved, {len(filtered)} after quality filter (threshold=0.50)")
        return filtered
    except Exception as e:
        print(f"Error searching Qdrant: {e}")
        return []

def get_inventory_summary(db: Session, lang: str = "es"):
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
            "activities": count_active(Activity),
            "promotions": count_active(Promotion),
            "announcements": count_active(Content, 'announcement')
        }
        print(f"📊 INVENTORY COUNTS: {summary}")
        
        def get_samples_with_metadata(Model, entity_type=None, limit=5):
            query = db.query(Model)
            if hasattr(Model, 'is_active'):
                query = query.filter(Model.is_active == True)
            elif hasattr(Model, 'status'):
                query = query.filter(Model.status == 'published')
            if entity_type and hasattr(Model, 'type'):
                query = query.filter(Model.type == entity_type)
            
            if hasattr(Model, 'created_at'):
                query = query.order_by(Model.created_at.desc())
            elif hasattr(Model, 'id'):
                query = query.order_by(Model.id.desc())
                
            items = query.limit(limit).all()
            if not items: return ""
            
            details = []
            for item in items:
                title = getattr(item, 'title', None) or getattr(item, 'name', None)
                
                # Extract translated title if available
                translations = getattr(item, 'translations', {}) or {}
                if lang in translations and isinstance(translations[lang], dict):
                    title = translations[lang].get('title') or translations[lang].get('name') or title

                slug = getattr(item, 'slug', None)
                if not title: continue
                
                # If no slug, generate one for linking (Massages/Therapies)
                if not slug:
                    import unicodedata
                    # Match frontend's normalize logic as closely as possible
                    raw_name = getattr(item, 'name', title)
                    normalized = unicodedata.normalize('NFD', raw_name.lower().strip())
                    ascii_name = normalized.encode('ascii', 'ignore').decode('ascii')
                    slug = re.sub(r'[-\s]+', '-', re.sub(r'[^\w\s-]', '', ascii_name)).strip('-')
                
                # Generate correct URL based on type
                url = ""
                if Model == YogaClassDefinition:
                     url = "/clases-de-yoga"
                elif Model == MassageType:
                     url = f"/terapias/masajes?item={slug}"
                elif Model == TherapyType:
                     url = f"/terapias/terapias-holisticas?item={slug}"
                elif entity_type == 'article':
                     url = f"/blog/{slug}"
                elif entity_type == 'meditation':
                     url = f"/meditaciones/{slug}"
                elif entity_type == 'announcement':
                     url = "/#noticias" 
                elif Model == Promotion:
                     url = "/" 
                elif Model == Activity:
                     url = f"/actividades?activity={item.id}"
                
                info = f"'{title}' (URL: {url})" if url else f"'{title}'"
                
                # Add schedule info if available (for Yoga classes)
                if hasattr(item, 'schedules') and item.schedules:
                    times = [f"{s.day_of_week} {s.start_time}" for s in item.schedules if s.is_active]
                    if times:
                        info += f" [Horario: {', '.join(times)}]"

                # Add details for Promotions and Announcements to help the bot explain them
                desc = ""
                if Model == Promotion:
                     d_text = getattr(item, 'description', '')
                     # Try translation for promotion description
                     if lang in translations and isinstance(translations[lang], dict):
                         d_text = translations[lang].get('description') or d_text

                     d_code = getattr(item, 'discount_code', '')
                     d_pct = getattr(item, 'discount_percentage', '')
                     extras = []
                     if d_pct: extras.append(f"{d_pct}% dto")
                     if d_code: extras.append(f"Código: {d_code}")
                     if d_text: extras.append(d_text[:60] + "..." if len(d_text) > 60 else d_text)
                     if extras: desc = f"Info: {', '.join(extras)}"

                elif entity_type == 'announcement':
                     # For announcements, the relevant text is usually in 'body' or 'description'
                     body = getattr(item, 'body', '') or getattr(item, 'description', '') or ''
                     
                     if lang in translations and isinstance(translations[lang], dict):
                         body = translations[lang].get('body') or translations[lang].get('description') or body
                         
                     # Strip HTML if possible/simple, or just take raw text
                     clean_body = re.sub('<[^<]+?>', '', body) # Basic strip tags
                     if clean_body: 
                        trunc = clean_body[:80] + "..." if len(clean_body) > 80 else clean_body
                        desc = f"Detalle: {trunc}"

                if desc:
                    info += f" [{desc}]"
                
                details.append(info)
            label = "ITEMS DISPONIBLES"
            if entity_type == 'article' or entity_type == 'meditation' or entity_type == 'announcement':
                label = "ÚLTIMOS PUBLICADOS"
            
            return f" ({label}: " + ", ".join(details) + ")" if details else ""

        parts = []
        # Limit samples to 10 per category to ensure bot sees the whole schedule
        if summary['yoga']: parts.append(f"YOGA: {summary['yoga']} clases{get_samples_with_metadata(YogaClassDefinition, limit=10)}")
        if summary['massage']: parts.append(f"MASAJES: {summary['massage']} tipos{get_samples_with_metadata(MassageType, limit=10)}")
        if summary['therapy']: parts.append(f"TERAPIAS: {summary['therapy']} tipos{get_samples_with_metadata(TherapyType, limit=10)}")
        if summary['articles']: parts.append(f"{summary['articles']} artículos en el blog{get_samples_with_metadata(Content, 'article', limit=10)}")
        if summary['meditations']: parts.append(f"{summary['meditations']} meditaciones guiadas{get_samples_with_metadata(Content, 'meditation', limit=10)}")
        if summary['activities']: parts.append(f"{summary['activities']} actividades{get_samples_with_metadata(Activity, limit=10)}")
        if summary['promotions']: parts.append(f"{summary['promotions']} promociones activas{get_samples_with_metadata(Promotion, limit=10)}")
        if summary['announcements']: parts.append(f"{summary['announcements']} noticias{get_samples_with_metadata(Content, 'announcement', limit=10)}")
        
        result = "INVENTARIO DETALLADO: " + "; ".join(parts) + "."
        print(f"🔍 FULL INVENTORY TEXT: {result}")
        return result

    except Exception as e:
        print(f"Error getting inventory summary: {e}")
        return ""

def format_context(search_results, max_docs: int = 3):
    """Format the retrieved documents into a context string (max 3 relevant docs)."""
    if not search_results:
        return ""
    
    context_parts = []
    for i, res in enumerate(search_results):
        if i >= max_docs: break
        payload = res.payload
        meta = payload.get('metadata', {})
        score = getattr(res, 'score', None)
        
        # Try to find title
        title = payload.get('title') or meta.get('title') or meta.get('name') or 'Sin Título'
        
        # Try to find content
        content = payload.get('content') or payload.get('chunk_text') or ''
        if not content:
            content = payload.get('description') or meta.get('description', '')
            
        # Truncate to keep token usage lean (800 chars per doc)
        if len(content) > 1000:
            content = content[:1000] + "..."
            
        # Try to find type
        type_ = payload.get('type') or payload.get('entity_type') or meta.get('type') or 'general'
        score_str = f" | score={score:.2f}" if score else ""
        
        # Try to find date
        date_str = payload.get('publish_date') or meta.get('publish_date') or meta.get('created_at') or ''
        date_info = f"\nFECHA: {date_str}" if date_str else ""
        
        context_parts.append(f"""--- {type_.upper()}{score_str} ---
TÍTULO: {title}{date_info}
CONTENIDO: {content}
""")
    
    return "\n".join(context_parts)

def clean_ai_response(text: str) -> str:
    """Forcefully remove absolute URLs from AI response for consistency."""
    if not text: return text
    # Remove http://localhost:3000, http://localhost:8000, or any domain-like prefix from buttons
    text = re.sub(r'\[\[BUTTON:(.*?)\|https?://[a-zA-Z0-9\.:]+/+', r'[[BUTTON:\1|/', text)
    # Also clean if it hallucinates just the URL outside a button
    text = re.sub(r'https?://localhost:[0-9]+', '', text)
    return text


# --- Endpoints ---

@router.get("/config")
async def get_agent_config(db: Session = Depends(get_db)):
    # Try cache first
    cached = await cache.get(key_agent_config())
    if cached:
        return cached

    config = db.query(AgentConfig).first()
    if not config:
        config = AgentConfig(
            tone="Asistente Amable",
            response_length="balanced",
            emoji_style="moderate",
            focus_area="info",
            system_instructions="",
            quiz_model="groq",
            chatbot_model="openai"
        )
        db.add(config)
        db.commit()
        db.refresh(config)

    config_dict = {
        "id": config.id,
        "tone": config.tone,
        "response_length": config.response_length,
        "emoji_style": config.emoji_style,
        "focus_area": config.focus_area,
        "system_instructions": config.system_instructions,
        "quiz_model": config.quiz_model,
        "chatbot_model": config.chatbot_model,
        "is_active": config.is_active,
    }
    await cache.set(key_agent_config(), config_dict, ttl=TTL_CONFIG)
    return config_dict

class AgentConfigUpdate(BaseModel):
    tone: str
    response_length: str
    emoji_style: str
    focus_area: str
    system_instructions: Optional[str] = None
    quiz_model: Optional[str] = "groq"
    chatbot_model: Optional[str] = "openai"
    is_active: bool

@router.post("/config")
async def update_agent_config(config_data: AgentConfigUpdate, db: Session = Depends(get_db)):
    config = db.query(AgentConfig).first()
    if not config:
        config = AgentConfig()
        db.add(config)
    
    config.tone = config_data.tone
    config.response_length = config_data.response_length
    config.emoji_style = config_data.emoji_style
    config.focus_area = config_data.focus_area
    config.system_instructions = config_data.system_instructions
    config.quiz_model = config_data.quiz_model
    config.chatbot_model = config_data.chatbot_model
    config.is_active = config_data.is_active
    
    db.commit()
    db.refresh(config)

    # Invalidate the agent config cache so next request fetches fresh data
    await cache.delete(key_agent_config())

    return config

from fastapi.responses import StreamingResponse
import json
import asyncio

@router.post("/chat")
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Endpoint principal del Chatbot RAG con soporte para Streaming y caché Redis.
    """
    if not openai_client and not groq_client and not gemini_model:
        return ChatResponse(response="Lo siento, no hay ningún proveedor de IA configurado.")
        
    # Get configuration — try cache first, fallback to DB
    cached_config = await cache.get(key_agent_config())
    if cached_config:
        config = type('AgentConfig', (), cached_config)()
    else:
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
    
    # 2. Retrieve Context (RAG) and Inventory — use Redis cache for inventory
    user_lang_code = request.language[:2]
    cache_key = key_inventory(user_lang_code)
    inventory_summary = await cache.get(cache_key)
    if inventory_summary is None:
        inventory_summary = get_inventory_summary(db, lang=user_lang_code)
        await cache.set(cache_key, inventory_summary, ttl=TTL_INVENTORY)
        print(f"💾 Inventory MISS — built from DB and cached for {TTL_INVENTORY}s")
    else:
        print(f"⚡ Inventory HIT from Redis cache")

    print(f"🌍 DEBUG INVENTORY: {inventory_summary}")
    rag_limit = 6 if request.is_quiz else 3
    retrieved_docs = search_knowledge_base(user_query, limit=rag_limit)
    context_text = format_context(retrieved_docs, max_docs=rag_limit)
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

    # Multi-language headers for the quiz
    quiz_headers = {
        "Español": {
            "h1": "Sobre lo que nos has compartido",
            "h2": "Nuestra propuesta para ti",
            "h3": "Un recurso para profundizar",
            "h4": "Un pequeño apoyo para ahora",
            "btn_more": "Saber más",
            "btn_content": "Ver ahora"
        },
        "English": {
            "h1": "About what you shared",
            "h2": "Our proposal for you",
            "h3": "A resource to deepen",
            "h4": "A little support for now",
            "btn_more": "Learn more",
            "btn_content": "See now"
        },
        "Català (Catalán)": {
            "h1": "Sobre el que ens has compartit",
            "h2": "La nostra proposta per a tu",
            "h3": "Un recurs per aprofundir",
            "h4": "Un petit suport per ara",
            "btn_more": "Saber-ne més",
            "btn_content": "Veure ara"
        }
    }
    h = quiz_headers.get(target_lang, quiz_headers["Español"])

    # 3. Construct System Prompt
    if request.is_quiz:
        system_prompt = f"""Eres un terapeuta experto y compasivo del centro 'Arunachala'.
Analiza el cuestionario para ofrecer una hoja de ruta de bienestar personalizada.
RESPONDE SIEMPRE EN EL IDIOMA: {target_lang}.

VARIEDAD (REGLA DE ORO): Tienes libertad para elegir entre todo el INVENTARIO REAL. No te limites siempre a los mismos items. Rota entre diferentes meditaciones, artículos y clases según el matiz de las respuestas del usuario.

INVENTARIO REAL:
{inventory_summary}

ESTRUCTURA DE RESPUESTA OBLIGATORIA (Usa exactamente estos 4 títulos en negrita en {target_lang}. PROHIBIDO TOTALMENTE añadir ":" o "." o cualquier signo de puntuación inmediatamente tras el título o el cierre de las negritas):

**{h['h1']}**
[Un párrafo humano y cercano analizando su situación].

PASO 1: Piensa y escribe una explicación personalizada (2-3 frases) conectando con el usuario.
PASO 2: En la línea siguiente, escribe EL BOTÓN con la URL EXACTA que copiaste del inventario.

EJEMPLO DE YOGA CORRECTO:
**{h['h2']}**
Te recomiendo probar nuestras clases de Hatha Yoga para equilibrar tu energía. Son ideales para reconectar con tu cuerpo y calmar la mente.
[[BUTTON:{h['btn_more']}|/clases-de-yoga]]

EJEMPLO DE MEDITACIÓN CORRECTO:
**{h['h3']}**
Esta meditación guiada "Paz Interior" te ayudará a soltar la tensión acumulada. Escúchala antes de dormir para un descanso reparador.
[[BUTTON:{h['btn_content']}|/meditaciones/paz-interior]]

REGLAS CRÍTICAS:
1. SIEMPRE escribe la explicación antes del botón.
2. NUNCA inventes URLs. Usa SOLO las que ves en el inventario.
3. SI ES YOGA -> IMPORTANTE: La URL SIEMPRE es /clases-de-yoga (sin nada más).
4. SI ES BLOG -> /blog/slug-real
5. SI ES TERAPIA -> /terapias/terapias-holisticas?item=slug-real (USA 'item' no 'slug')
6. SI ES MASAJE -> /terapias/masajes?item=slug-real (USA 'item' no 'slug')

IDIOMA: Responde íntegramente en {target_lang}. NUNCA mezcles idiomas ni menciones nombres en español si estás en inglés/catalán. TRADUCE TODO.

INFORMACIÓN EXTRA Y DETALLADA DE LA WEB (RAG):
{context_text}
"""
    else:
        system_prompt = f"""Eres Arunachala Bot, asistente de 'Arunachala Yoga y Terapias' en Cornellà.

IDIOMA DEL USUARIO: {target_lang}.

INVENTARIO REAL ACTUALIZADO:
{inventory_summary}

CONFIGURACIÓN DE ESTILO:
 - TONO: {tone} / {length_instruction}
 - EMOJIS: {emoji_instruction}
 - OBJETIVO: {focus_instruction}

REGLAS DE TRADUCCIÓN OBLIGATORIAS:
 - Responde íntegramente en {target_lang}.
 - TRADUCCIÓN EXTREMA: Traduce ABSOLUTAMENTE TODO al IDIOMA DEL USUARIO, incluyendo los nombres de los masajes, las terapias, los nombres de las actividades y los títulos de los artículos.
 - PROHIBIDO: Mezclar idiomas. Si un usuario pregunta en Inglés, usa términos en inglés (ej: "Reflexology"). Si un usuario pregunta en Catalán, usa términos en catalán.
 - NUNCA cites textualmente en un idioma distinto al del usuario. Traduce las citas del contexto web.
 - SALUDO: Apropiado en {target_lang} (ej: 'Namasté').

REGLAS DE URLS:
 - NUNCA muestres la URL en texto plano literal como "(URL: /ruta)".
 - OBLIGATORIO: Si mencionas un artículo, terapia o servicio con ruta, hazlo SIEMPRE en formato Markdown: [Nombre traducido del servicio](/ruta)
 - Yoga: /clases-de-yoga (SIEMPRE).
 - Masajes: /terapias/masajes?item=SLUG (USA el parámetro ?item=...)
 - Terapias Holísticas: /terapias/terapias-holisticas?item=SLUG (USA el parámetro ?item=...)
 - Blog/Artículos: /blog/SLUG
 - Meditación: /meditaciones/SLUG
 - Actividades/Eventos: /actividades?activity=ID

PROHIBIDO USAR URLs COMPLETAS: Usa solo rutas relativas (ej: /blog/mi-slug). NUNCA escribas "http://...".

INSTRUCCIONES EXTRA DEL ADMINISTRADOR:
{extra_instructions}

CONTEXTO ESPECÍFICO DE LA WEB:
{context_text}

CONVERSACIÓN:
 - Responde dudas usando SOLAMENTE el CONTEXTO WEB traduciéndolo al {target_lang}.
 - Sé 100% preciso con horarios y precios. Si un servicio NO tiene detalles de horario o precio aquí, DI CLARAMENTE que no dispones de esa información.
 - Si te preguntan por un servicio, horario (ej: clases los sábados) o precio que NO está detallado expresamente en el INVENTARIO o CONTEXTO, **prohibido inventarlo**. Responde que no tienes esa información o sugiere visitar la página correspondiente.
 - NUNCA inventes enlaces. Solo usa links basados en el formato anterior con el SLUG real.
 - NO digas "según el documento". Integra la info.
"""

    # Select preferred model based on config
    selected_model_type = config.quiz_model if request.is_quiz else config.chatbot_model
    
    # helper to check if a provider is available
    def get_provider_call(model_type):
        if model_type == "groq" and groq_client:
            return "groq"
        if model_type == "openai" and openai_client:
            return "openai"
        if model_type == "gemini" and gemini_model:
            return "gemini"
        return None

    # 4. Prepare messages
    api_messages = [{"role": "system", "content": system_prompt}]
    for msg in request.messages[-5:]: 
        api_messages.append({"role": msg.role, "content": msg.content})

    if request.stream:
        async def stream_generator():
            try:
                yield f"data: {json.dumps({'sources': []})}\n\n"
                
                # Try preferred first, then fallbacks
                order = [selected_model_type, "groq", "openai", "gemini"]
                used_provider = None
                for provider in order:
                    if get_provider_call(provider):
                        used_provider = provider
                        break
                
                if not used_provider:
                    yield f"data: {json.dumps({'error': 'No hay proveedores de IA disponibles'})}\n\n"
                    return

                if used_provider == "openai":
                    stream = openai_client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=api_messages,
                        temperature=0.7,
                        stream=True
                    )
                    for chunk in stream:
                        if chunk.choices and chunk.choices[0].delta.content:
                            yield f"data: {json.dumps({'content': chunk.choices[0].delta.content})}\n\n"

                elif used_provider == "gemini":
                    prompt = "\n".join([f"{m['role']}: {m['content']}" for m in api_messages])
                    response = gemini_model.generate_content(prompt, stream=True)
                    for chunk in response:
                        if chunk.text:
                            yield f"data: {json.dumps({'content': chunk.text})}\n\n"

                elif used_provider == "groq":
                    stream = groq_client.chat.completions.create(
                        model="llama-3.3-70b-versatile",
                        messages=api_messages,
                        temperature=0.7,
                        stream=True
                    )
                    for chunk in stream:
                        if chunk.choices[0].delta.content:
                            content = clean_ai_response(chunk.choices[0].delta.content)
                            if content:
                                yield f"data: {json.dumps({'content': content})}\n\n"
                
                yield "data: [DONE]\n\n"
            except Exception as e:
                print(f"Streaming Error: {e}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return StreamingResponse(stream_generator(), media_type="text/event-stream")

    else:
        # Non-streaming response
        try:
            order = [selected_model_type, "groq", "openai", "gemini"]
            used_provider = None
            for provider in order:
                if get_provider_call(provider):
                    used_provider = provider
                    break
            
            if not used_provider:
                raise HTTPException(status_code=500, detail="No hay proveedores disponibles")

            if used_provider == "groq":
                completion = groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=api_messages,
                    temperature=0.7
                )
                ai_response = completion.choices[0].message.content
            elif used_provider == "gemini":
                prompt = "\n".join([f"{m['role']}: {m['content']}" for m in api_messages])
                response = gemini_model.generate_content(prompt)
                ai_response = response.text
            elif used_provider == "openai":
                completion = openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=api_messages,
                    temperature=0.7
                )
                ai_response = completion.choices[0].message.content
            
            ai_response = clean_ai_response(ai_response)
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
    secret: Optional[str] = None
):
    """
    Resets the RAG memory in Qdrant based on the provided scope.
    """
    if secret != os.getenv("ADMIN_SECRET", "admin123"):
        raise HTTPException(status_code=401, detail="Unauthorized")
        
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


@router.get("/rag-diagnostics")
async def rag_diagnostics(secret: Optional[str] = None):
    """
    Devuelve un diagnóstico detallado del estado de la base de datos vectorial Qdrant.
    Muestra total de vectores, distribución por tipo y vectores con contenido vacío.
    """
    if secret != os.getenv("ADMIN_SECRET", "admin123"):
        # We could also allow current_user here, but secret is easier for scripts
        raise HTTPException(status_code=401, detail="Unauthorized")

    if not qdrant_client:
        raise HTTPException(status_code=503, detail="Qdrant service not available")

    try:
        collections = qdrant_client.get_collections()
        exists = any(c.name == COLLECTION_NAME for c in collections.collections)
        if not exists:
            return {"status": "no_collection", "total_vectors": 0, "by_type": {}, "empty_content": 0}

        info = qdrant_client.get_collection(COLLECTION_NAME)
        total = info.points_count

        by_type = {}
        content_samples = {}
        empty_content_ids = []
        offset = None

        while True:
            scroll_result = qdrant_client.scroll(
                collection_name=COLLECTION_NAME,
                limit=100,
                offset=offset,
                with_payload=True,
                with_vectors=False
            )
            points, next_offset = scroll_result

            for point in points:
                payload = point.payload or {}
                ptype = payload.get("type", payload.get("entity_type", "unknown"))
                by_type[ptype] = by_type.get(ptype, 0) + 1
                
                if ptype not in content_samples:
                    content_samples[ptype] = payload.get("content", "")[:100]

                content = payload.get("content", "").strip()
                if not content or "Sin contenido" in content or len(content) < 40:
                    empty_content_ids.append(str(point.id))

            if next_offset is None:
                break
            offset = next_offset

        return {
            "status": "ok",
            "collection": COLLECTION_NAME,
            "total_vectors": total,
            "by_type": by_type,
            "content_samples": content_samples,
            "empty_content_count": len(empty_content_ids),
            "empty_content_sample": empty_content_ids[:10],
            "score_threshold_active": 0.40,
            "max_docs_per_query": 3,
        }
    except Exception as e:
        print(f"Error in rag-diagnostics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

