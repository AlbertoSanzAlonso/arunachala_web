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
├── infraestructura/   # Docker + PostgreSQL
├── n8n-workflows/   # AI automation
└── docs/            # Documentation
```

## 🚀 Development Commands
- **Backend**: `cd backend && uvicorn app.main:app --reload`
- **Frontend**: `cd frontend && npm start`  
- **Database**: `cd infraestructura && docker-compose up -d`
- **Tests**: `pytest` (backend) + `npm test` (frontend)
- **Linting**: `flake8` (backend) + `npm run lint` (frontend)

## 🔧 Environment Variables Required
- OpenAI API, WhatsApp Business, Database strings, JWT keys

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

## 🔄 Git Workflow
```
main/master    ← Production (protected)
develop        ← Integration (protected)  
feature/*      ← Individual features
```

**Commit Format**: `type(scope): description`  
**Branch Strategy**: feature → develop → main  
**Protection Rules**: Reviews required for main/develop

---

## 🛡️ Security Notes
- Environment variables never committed
- JWT for authentication
- Input validation with Pydantic
- SQL injection prevention via SQLAlchemy
- API rate limiting

---

## ✅ Benefits of This System
- **Zero Configuration**: Skills auto-invoke without manual setup
- **Context-Aware**: Intelligent selection based on task requirements
- **Consistent**: Project patterns maintained automatically
- **Scalable**: Skills collaborate with each other
- **Multi-IDE**: Compatible with Antigravity and OpenCode
- **9 specialized skills**: Frontend, backend, UI/UX design, and Git workflow