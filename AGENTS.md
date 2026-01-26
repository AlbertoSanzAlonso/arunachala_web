# Arunachala Yoga Web - Project Configuration for OpenCode & Google Antigravity

## 🎯 Quick Overview
Full-stack web application for Arunachala Yoga studio with automated content generation and wellness tools.

**Tech Stack**: FastAPI + React + PostgreSQL + AI + WhatsApp  
**Features**: Yoga scheduling, in-studio therapy booking, AI content, user management

## 🏗️ Project Structure
```
arunachala_web/
├── backend/          # FastAPI + SQLAlchemy + Pydantic
├── frontend/         # React + TypeScript + Tailwind  
├── infraestructura/   # Docker + PostgreSQL (Configured at root/infraestructura)
├── n8n-workflows/   # AI automation
└── docs/            # Documentation
```

## 🚀 Development Commands
- **Backend**: `cd backend && ../venv/bin/uvicorn app.main:app --reload` (Uses root `venv`)
- **Frontend**: `cd frontend && npm start`  
- **Database**: `cd infraestructura && docker-compose up -d`
- **Tests**: `pytest` (backend) + `npm test` (frontend)
- **Linting**: `flake8` (backend) + `npm run lint` (frontend)
- **Environment Note**: Python virtual environment is located at project root (`/venv`), NOT in `backend/venv`.

## 🔧 Environment Configuration
There are EXACTLY TWO required `.env` files in the project. Do NOT create one in the root.

### 1. Backend Configuration (`backend/.env`)
Used by FastAPI (Python). Must contain:
- `DATABASE_URL=postgresql://arunachala:arunachala1234@localhost:5432/arunachala_db` (Local development)
- `DATABASE_URL` (Neon dynamic URL for production)
- `SECRET_KEY`: For JWT tokens.
- `ALGORITHM`: Encryption algorithm (e.g., HS256).

### 2. Infrastructure Configuration (`infraestructura/.env`)
Located in `root/infraestructura/`. This folder contains the `docker-compose.yml` for PostgreSQL, n8n, and NocoDB.
Must contain:
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`: For creating the DB container.
- `NOCODB_PORT`: Port for the NocoDB dashboard.
- `N8N_ENCRYPTION_KEY`, `GENERIC_TIMEZONE`: For n8n automation.

**⚠️ IMPORTANT**: Never commit these files to Git. Use `.env.example` as a template.

---

## 🎨 Page Creation Standards (Frontend)

To ensure consistency, SEO, ease of maintenance, and high performance, all new pages **MUST** follow these guidelines:

### 1. SEO & Metadata
- **Tool**: Use `react-helmet-async` for all head management.
- **Requirement**: Every page must define a `<title>` and `<nav>` meta tags (description, keywords).
- **URLs**: URLs MUST be in Spanish and SEO-friendly (e.g., use `/terapias-y-masajes` instead of `/therapies`).
- **Structure**:
```tsx
import { Helmet } from 'react-helmet-async';
// Inside component return:
<Helmet>
  <title>Page Title | Arunachala</title>
  <meta name="description" content="Detailed page description..." />
</Helmet>
```

### 2. Performance & Lazy Loading
- **Suspense**: Wrap heavy or below-the-fold components in `React.lazy` imports and `<Suspense>` boundaries.
- **Images**: Use `loading="lazy"` for images that are not in the initial viewport (hero section).
- **Code Splitting**: Main route components should be lazy loaded in `App.tsx`.

### 3. Accessibility (a11y)
- **Semantic HTML**: Use proper tags (`<main>`, `<article>`, `<section>`, `<nav>`) instead of generic `<div>`.
- **Labels**: All interactive elements (buttons, links within icons) MUST have an `aria-label` or visible text.
- **Images**: Mandatory `alt` text describing the image content.
- **Redundancy**: Avoid `role="article"` on `<article>` tags or similar default semantics.

### 4. Code & Import Organization
- **Imports**: Group imports: React/libs first, Components second, Assets/Config last.
- **Clean Code**: Remove unused imports or variables immediately.

### 5. Mobile & Responsive Design
- **Spacing**: Use generous padding/gap for mobile layouts to ensure touch targets are accessible and content breathes (e.g., `py-24`, `gap-8`).
- **Typography**: Adjust font sizes for smaller screens using Tailwind responsive prefixes (`text-3xl md:text-5xl`).

### 6. UX & Animations
- **Smooth Scroll**: Use `element.scrollIntoView({ behavior: 'smooth' })` for internal navigation.
- **Transitions**: Use `<FadeInSection>` (framer-motion wrapper) for sections appearing on scroll.
- **Feedback**: Provide loading skeletons or spinners (`fallback={<Loader />}`) for async content.

---

## ☁️ Deployment Strategy (Hybrid)

This project is configured to work seamlessly in both **Local Development** (Docker/Localhost) and **Production** (Cloud Services) without code changes, using a hybrid configuration strategy.

### 🏗️ Production Architecture (Free Tier Friendly)

| Component | Service | Reason |
|---|---|---|
| **Frontend** | **Vercel** | Best for React/Fast builds. Zero config. |
| **Backend** | **Render** | Native Python/FastAPI support. Free tier available. |
| **Database** | **Neon / Supabase** | Managed PostgreSQL (Free tier). |
| **Storage** | **Cloudinary** | Persist images in the cloud (since Render disk is ephemeral). |

### 🌍 Production Environment Variables
When deploying to Render/Vercel, you MUST configure these variables in their dashboards:

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

### 🔄 Hybrid Storage System (`backend/app/core/image_utils.py`)
The backend automatically detects the environment:
- **IF** `STORAGE_TYPE` is missing or "local" → Saves files to `/backend/static/` (Localhost).
- **IF** `STORAGE_TYPE` is "cloudinary" → Uploads to Cloudinary and returns secure URL (Production).

---

## 🤖 Agent Skills System

### 📁 Skills Directory
- **Google Antigravity**: `.agent/skills/`
- **OpenCode**: `.opencode/skills/`

### 🎯 Available Skills (9 total)

#### 🚀 Development Skills
| Skill | Purpose | When to use? |
|---|---|---|
| **fastapi-developer** | Backend FastAPI, SQLAlchemy, Pydantic | Create endpoints, models, API |
| **react-developer** | React components, TypeScript, Tailwind | UI components, hooks, routing |
| **ui-design-system** | UI/UX design system with Tailwind CSS | Styling, components, layouts, animations |
| **environment-management** | Run/Manage Frontend & Backend envs | Starting servers, installing deps, troubleshooting |

#### 🎯 Domain Skills  
| Skill | Purpose | When to use? |
|---|---|---|
| **booking-system** | In-studio therapy booking system | Classes, schedules, availability |
| **ai-content** | AI-powered content (mantras, articles) | Daily mantras, SEO content |

#### 🔧 Git/GitHub Skills
| Skill | Purpose | When to use? |
|---|---|---|
| **github-workflow** | Complete GitHub (PRs, releases, teams) | Pull requests, releases, configuration |
| **git-commands** | Essential Git commands | Branch, commits, push, conflicts |
| **branch-protection** | Security & branch protection | Protect main/develop, quality gates |

---

## 🤖 Auto-invocation of Skills

### 🔍 How It Works
1. **Detection**: Agent detects keywords + context from user input
2. **Auto-invocation**: Selects and loads relevant skills based on task
3. **Application**: Applies specialized patterns from project context
4. **Coordination**: Multiple skills collaborate for complex tasks

### 📋 Quick Examples

| User Task | Auto-invoked Skills |
|---|---|
| "Create API endpoint" | `fastapi-developer` |
| "React component for booking" | `react-developer` + `booking-system` |
| "Generate daily mantra" | `ai-content` |
| "Create new feature branch" | `git-commands` |
| "Make pull request" | `github-workflow` |
| "Protect main branch" | `branch-protection` |
| "Style CSS components" | `ui-design-system` |
| "Create landing page" | `ui-design-system` + `react-developer` |
| "Design buttons and cards" | `ui-design-system` |
| "Implement animations" | `ui-design-system` |
| "Create responsive layout" | `ui-design-system` |
| "Book therapy session" | `react-developer` + `booking-system` |
| "Design therapy booking interface" | `ui-design-system` + `booking-system` |

### 🔄 Complex Tasks (Stack Combinations)

**Example**: "Create complete booking feature with React frontend and API backend"
```
1. git-commands → Create feature branch
2. fastapi-developer → Create API endpoints  
3. react-developer → Create UI components
4. ui-design-system → Apply styling and design patterns
5. booking-system → Apply business logic
6. github-workflow → Create PR and merge
```

---

## 🏛️ Architecture Standards (Clean Architecture)

All code written for this project MUST adhere to **Clean Architecture** principles to ensure maintainability, testability, and separation of concerns.

### 🐍 Backend (FastAPI)
The backend must follow a layered architecture:
1.  **Interface Layer (`app/api` - Routers)**: Handles HTTP requests/responses. **NO BUSINESS LOGIC ALLOWED HERE**. Delegates work to the Service Layer.
2.  **Service Layer (`app/services`)**: Contains all business logic (Use Cases). Independent of the HTTP framework. Orchestrates data operations.
3.  **Data Layer (`app/models` / `app/core`)**: Handles database models and raw data access.
4.  **Dependencies**: Layers should depend on abstractions (or inner layers), not outer layers.

### ⚛️ Frontend (React)
The frontend must separate View from Logic:
1.  **UI Components (`src/components`)**: Presentational "dumb" components. Responsible only for rendering props.
2.  **Container/Pages (`src/pages`)**: Orchestration components. Handle state and pass data to UI components.
3.  **Logic & Adapters (`src/hooks`)**: Custom hooks that encapsulate complex logic and state management.
4.  **Infrastructure (`src/services`)**: API client and external communication. Components NEVER call standard `fetch`/`axios` directly; they verify strict interfaces via services.

---

## 🔄 Git Workflow
```
main/master    ← Production (protected)
develop        ← Integration (protected)  
feature/*      ← Individual features
```

**Commit Format**: `type(scope): description` (Must be brief and in English)  
**Branch Strategy**: feature → develop → main  
**Protection Rules**: Reviews required for main/develop

---

## 🛡️ Security Notes
- Environment variables never committed
- JWT for authentication
- Input validation with Pydantic
- SQL injection prevention via SQLAlchemy
- API rate limiting
- Rate limit creation: use `Limiter(key_func=get_remote_address)`

---

## ✅ Benefits of This System
- **Zero Configuration**: Skills auto-invoke without manual setup
- **Context-Aware**: Intelligent selection based on task requirements
- **Consistent**: Project patterns maintained automatically
- **Scalable**: Skills collaborate with each other
- **Multi-IDE**: Compatible with Antigravity and OpenCode
- **9 specialized skills**: Frontend, backend, UI/UX design, and Git workflow