# Arunachala Yoga Web

Plataforma web para el estudio de yoga Arunachala con sistema de reservas, contenido automatizado y herramientas de bienestar.

## 🏗️ Arquitectura

- **Backend**: FastAPI + PostgreSQL + SQLAlchemy
- **Frontend**: React + TypeScript + Tailwind CSS  
- **Automatización**: n8n + IA (OpenAI API)
- **Chat**: WhatsApp Business AI (Meta Business API)

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
├── n8n-workflows/         # Automatizaciones
├── infraestructura/       # Docker + DB
└── docs/                  # Documentación
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
- [ ] Home dual selector
- [ ] Sistema de reservas
- [ ] Mantra diario IA
- [ ] Chat WhatsApp
- [ ] Videoteca
- [ ] Panel usuario

## 🤖 Automatizaciones

- **Mantra Diario**: IA genera → DB → WhatsApp → Web
- **Artículos SEO**: IA crea → Optimiza → Publica  
- **Cuestionarios**: Procesa → Recomendaciones personalizadas