# Arunachala Yoga Web

Plataforma web para el estudio de yoga Arunachala con sistema de reservas, contenido automatizado y herramientas de bienestar.

## 🏗️ Arquitectura

- **Backend**: FastAPI (Hetzner VPS) + Supabase (PostgreSQL)
- **Frontend**: React + TypeScript (Vercel)
- **Automatización**: n8n + AI (Hetzner VPS)
- **Base de Datos Vectorial**: Qdrant (Hetzner VPS)

## 📁 Estructura del Proyecto

```
arunachala_web/
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── models/         # Modelos de datos
│   │   ├── api/            # Endpoints REST
│   │   ├── services/       # Lógica de negocio
│   │   └── core/           # Configuración
│   └── requirements.txt
├── frontend/               # React App
│   ├── src/
│   │   ├── components/     # Componentes UI
│   │   ├── hooks/          # Hooks personalizados
│   │   └── services/       # Servicios API
│   └── package.json
├── n8n-workflows/         # Flujos de automatización
├── infraestructura/       # Configuración VPS (Docker, n8n, Qdrant)
└── docs/                  # Documentación técnica y de usuario
```

## 🚀 Inicio Rápido

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Base de Datos
```bash
cd infraestructura
docker-compose up -d
```

## 🌿 Flujo de Trabajo Git

Ver [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) para la estrategia completa de ramas.

## 📋 Módulos

- [x] Estructura base
- [x] Home dual selector
- [x] Sistema de reservas
- [x] Mantra diario IA
- [x] Chat WhatsApp
- [x] Videoteca
- [x] Panel usuario

## 🤖 Automatizaciones

- **Mantra Diario**: IA genera → DB → WhatsApp → Web
- **Artículos SEO**: IA crea → Optimiza → Publica  
- **Cuestionarios**: Procesa → Recomendaciones personalizadas
