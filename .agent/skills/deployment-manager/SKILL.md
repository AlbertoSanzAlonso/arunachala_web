---
name: deployment-manager
description: Instructions for deploying the application to Vercel (Frontend) and Render (Backend).
---

# Deployment Manager Skill

This skill handles the hybrid deployment strategy for the Arunachala Web project.

## ☁️ Deployment Strategy

This project is configured to work seamlessly in both **Local Development** (Docker/Localhost) and **Production** (Cloud Services) without code changes.

### 🏗️ Production Architecture (Free Tier Friendly)

| Component | Service | Reason |
|---|---|---|
| **Frontend** | **Vercel** | Best for React/Fast builds. Zero config. |
| **Backend** | **Render** | Native Python/FastAPI support. Free tier available. |
| **Database** | **Neon / Supabase** | Managed PostgreSQL (Free tier). |
| **Storage** | **Cloudinary** | Persist images in the cloud (since Render disk is ephemeral). |

### 🌍 Production Environment Variables

When deploying, you MUST configure these variables in the respective dashboards:

**Backend (Render):**
```bash
# Database
DATABASE_URL=postgresql://user:pass@endpoint.neon.tech/neondb?sslmode=require

# Security
SECRET_KEY=your-production-secret-key-very-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=["https://your-frontend.vercel.app"]

# Storage (Switch to Cloudinary)
STORAGE_TYPE=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend (Vercel):**
```bash
REACT_APP_API_URL=https://your-backend.onrender.com
```

### 🔄 Hybrid Storage System
The backend automatically detects the environment (`backend/app/core/image_utils.py`):
- **IF** `STORAGE_TYPE` is missing or "local" → Saves files to `/backend/static/` (Localhost).
- **IF** `STORAGE_TYPE` is "cloudinary" → Uploads to Cloudinary and returns secure URL (Production).
