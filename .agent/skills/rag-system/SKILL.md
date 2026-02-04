---
name: rag-system
description: Configuration and maintenance of the RAG (Retrieval-Augmented Generation) Chatbot system.
---

# AI RAG System Skill

This skill documents the Arunachala Bot, an AI-powered customer support chatbot with automatic knowledge synchronization and comprehensive tracking.

## 🧠 System Architecture

- **Components**:
    - **Frontend**: `ChatBot.tsx` (Floating UI).
    - **Backend**: `app.routers.chat` with `/api/chat` and `/api/ingest`.
    - **Vector DB**: Qdrant (runs on port 6333).
    - **LLM**: OpenAI `gpt-4o-mini` for responses and `text-embedding-3-small` for search.
    - **Sync Tracking**: PostgreSQL tables for monitoring vectorization status.

## 🔄 Auto-Knowledge Sync (n8n)

The system keeps knowledge up-to-date automatically using webhooks and n8n.

1.  **Trigger**: Every time a Yoga Class, Massage, Therapy, Content or Activity is Created/Updated/Deleted in the Dashboard.
2.  **Webhook**: `backend/app/core/webhooks.py` notifies n8n and creates tracking log.
3.  **n8n Workflow**:
    -   Receives `id`, `type`, and `log_id`.
    -   Fetches full data from Backend API.
    -   Generates embeddings (OpenAI).
    -   Upserts/Updates data in **Qdrant**.
    -   **Reports back** to `/api/rag/sync-callback` with status.
4.  **Backend Update**: Marks content as vectorized and updates tracking fields.

## 📊 Tracking System

### Database Tables:
- **`rag_sync_log`**: Complete history of all sync operations
  - Tracks: entity_type, entity_id, action, status, error_message, timestamps
  - Status: 'pending' → 'processing' → 'success'/'failed'

### Entity Fields (all RAG-synced tables):
- **`vector_id`**: UUID in Qdrant collection
- **`vectorized_at`**: Last successful vectorization timestamp
- **`needs_reindex`**: Boolean flag for content requiring re-sync

### Monitored Tables:
- `yoga_classes`
- `massage_types`
- `therapy_types`
- `contents` (only published)
- `activities` (only active)

## 🛠️ Admin Control & Monitoring

### Agent Control Page
The dashboard includes an "Agent Control" page to adjust:
-   Tone
-   Response length
-   Focus area

### Dashboard RAG Knowledge Center
The Agent Control page now features a visual "RAG Knowledge Center":
- **Real-time Monitoring**: Progress bars showing synchronization percentage per category.
- **Categorized Sync**: "Sincronizar" buttons that appear only when items need reindexing.
- **Global Commands**: "Sincronizar Todo lo Pendiente" and "Forzar Reindexación Completa".
- **Status API**: Communicates with `GET /api/rag/sync-status` and `POST /api/rag/sync`.

### API Endpoints
- **`GET /api/rag/sync-status`**: Consolidates statistics for the dashboard.
- **`POST /api/rag/sync`**: Trigger background sync for category or all items.
- **`POST /api/rag/sync-callback`**: n8n reports success/failure here.
- **`GET /api/rag/sync-logs`**: Recent operations history.

### Manual Sync Script
```bash
# Check sync status
python scripts/sync_rag.py --status

# Sync all content needing reindex
python scripts/sync_rag.py --sync-all

# Sync specific content type
python scripts/sync_rag.py --sync-type yoga

# Force reindex everything
python scripts/sync_rag.py --force-all
```

## 📖 Documentation
- Migration guide: `docs/RAG_MIGRATION_GUIDE.md`
- Database schema: `backend/migrations/001_add_rag_sync_system.sql`

