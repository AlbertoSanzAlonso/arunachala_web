---
name: rag-system
description: Configuration and maintenance of the RAG (Retrieval-Augmented Generation) Chatbot system.
---

# AI RAG System Skill

This skill documents the Arunachala Bot, an AI-powered customer support chatbot.

## 🧠 System Architecture

- **Components**:
    - **Frontend**: `ChatBot.tsx` (Floating UI).
    - **Backend**: `app.routers.chat` with `/api/chat` and `/api/ingest`.
    - **Vector DB**: Qdrant (runs on port 6333).
    - **LLM**: OpenAI `gpt-4o-mini` for responses and `text-embedding-3-small` for search.

## 🔄 Auto-Knowledge Sync (n8n)

The system keeps knowledge up-to-date automatically using webhooks and n8n.

1.  **Trigger**: Every time a Yoga Class, Massage, Therapy, **Activity**, **Article**, or **Meditation** is Created/Updated/Deleted in the Dashboard.
2.  **Webhook**: `backend/app/core/webhooks.py` notifies n8n.
3.  **n8n Workflow**:
    -   Receives `id` and `type`.
    -   Fetches full data from Backend API.
    -   Generates embeddings (OpenAI).
    -   Upserts/Updates data in **Qdrant**.

## 🛠️ Admin Control
The dashboard includes an "Agent Control" page to adjust:
-   Tone
-   Response length
-   Focus area
