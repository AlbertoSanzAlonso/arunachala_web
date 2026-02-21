---
name: deployment-manager
description: Instructions for deploying the application to Vercel (Frontend) and Hetzner (Backend).
---

# Deployment Manager Skill

This skill handles the production deployment architecture for the Arunachala Web project.

## ☁️ Deployment Strategy

The project uses a distributed cloud architecture optimized for performance, scalability, and cost-efficiency.

### 🏗️ Production Architecture

| Component | Service | Reason |
|---|---|---|
| **Frontend** | **Vercel** | Global CDN, high performance for React SPA, automatic CI/CD. |
| **Backend** | **Hetzner VPS** | Dedicated resources for FastAPI, n8n, and Qdrant. No "cold starts". |
| **Database** | **Supabase** | Managed PostgreSQL with built-in pooling and real-time capabilities. |
| **Storage** | **Supabase Storage**| High-performance object storage for media files and RAG assets. |

### 🌍 Production Environment Variables

When deploying, configure these variables in the respective dashboards:

**Backend (Hetzner VPS / Coolify):**
```bash
# Database (Supabase Transaction Pooler)
DATABASE_URL=postgresql://postgres.[PROJ_ID]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# Security
SECRET_KEY=your-production-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOWED_ORIGINS=["https://arunachala-yoga.vercel.app"]

# Storage
STORAGE_TYPE=supabase
SUPABASE_URL=https://[PROJ_ID].supabase.co
SUPABASE_KEY=your-service-role-key
SUPABASE_BUCKET=arunachala-images
```

**Frontend (Vercel):**
```bash
REACT_APP_API_URL=https://api.arunachala-yoga.com
```

### 🔄 Hybrid Storage System
The backend utilizes a smart storage abstraction (`backend/app/core/image_utils.py`):
- **Local Development**: Files are saved to `/backend/static/` during development.
- **Production**: Files are automatically uploaded to Supabase Storage and served via public URLs.

## 🛠️ Infrastructure Management (Hetzner)
The VPS is managed using **Coolify** or manual Docker Compose:
- **FastAPI**: Runs on the main server port.
- **n8n**: Automation engine reachable internally or via subpath.
- **Qdrant**: Vector database for AI search.

## 🚀 Deployment Workflow
1.  **Code Change**: Push to `main` branch on GitHub.
2.  **Frontend**: Vercel automatically builds and deploys.
3.  **Backend**: Coolify (Hetzner) detects the push, rebuilds the Docker image, and restarts the service.
