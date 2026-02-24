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

## ⚡ Performance & Caching (Redis)
To reduce database load and latency, the RAG system employs a dual-layer strategy:

- **Inventory Caching**: The `get_inventory_summary` function (which scans all available content for the AI) is cached in Redis for 5 minutes (`inventory:*` pattern).
- **Auto-Invalidation**: The backend automatically clears the Redis cache whenever content is updated or published, ensuring the AI always has fresh data without performance penalty.
- **Fail-safe**: If Redis is down, the system gracefully falls back to direct DB queries.

## 🛠️ Admin Control
The dashboard includes an "Agent Control" page to adjust:
-   **Model Selection**: Independently choose between **OpenAI (Quality)** and **Groq (Speed/Free)** for the main Chat and the Wellness Quiz.
-   **Tone & Personality**: Adjust the bot's behavior.
-   **Response length** and focus areas.

## 🔌 Frontend State Management (Modern Tech Stack)
-   **Zustand**: Controls the global open/close visibility state of the floating ChatBot UI (`useUIStore`).
-   **React Query (TanStack)**: Manages RAG status auto-polling and cache invalidation automatically in the AgentControl panel, heavily reducing local `useEffect` boilerplate.
