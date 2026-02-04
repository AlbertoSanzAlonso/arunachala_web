# Arunachala Yoga Web - Agent Configuration

## 🎯 Quick Overview
Full-stack web application for Arunachala Yoga studio (FastAPI + React + PostgreSQL).

## 🤖 Agent Skills System

The detailed documentation and procedural knowledge have been refactored into specialized specialized "Skill" files located in `.agent/skills/`.

Please refer to the specific skill file for detailed instructions.

### 🚀 Development Skills

| Skill | Description | Path |
|---|---|---|
| **environment-management** | Running the app (Frontend/Backend), managing `.env`, troubleshooting. | [.agent/skills/environment-management/SKILL.md](.agent/skills/environment-management/SKILL.md) |
| **fastapi-developer** | Backend architecture (Clean Arch), API naming, Pydantic models. | [.agent/skills/fastapi-developer/SKILL.md](.agent/skills/fastapi-developer/SKILL.md) |
| **react-developer** | Frontend architecture, Page standards (SEO/Perf), Hooks. | [.agent/skills/react-developer/SKILL.md](.agent/skills/react-developer/SKILL.md) |
| **ui-design-system** | Tailwind CSS styling, design patterns, animations. | [.agent/skills/ui-design-system/SKILL.md](.agent/skills/ui-design-system/SKILL.md) |
| **deployment-manager** | Hybrid deployment (Vercel/Render) and Cloudinary setup. | [.agent/skills/deployment-manager/SKILL.md](.agent/skills/deployment-manager/SKILL.md) |

### 🎯 Domain & Feature Skills

| Skill | Description | Path |
|---|---|---|
| **booking-system** | Logic for classes, schedules, and therapy booking. | [.agent/skills/booking-system/SKILL.md](.agent/skills/booking-system/SKILL.md) |
| **ai-content** | Daily mantras, auto-generated content logic. | [.agent/skills/ai-content/SKILL.md](.agent/skills/ai-content/SKILL.md) |
| **rag-system** | Chatbot architecture, Qdrant setup, n8n knowledge sync. | [.agent/skills/rag-system/SKILL.md](.agent/skills/rag-system/SKILL.md) |
| **multilingual-system** | i18next setup, database translation schemas (ES/CA/EN). | [.agent/skills/multilingual-system/SKILL.md](.agent/skills/multilingual-system/SKILL.md) |

### 🔧 Workflow Skills

| Skill | Description | Path |
|---|---|---|
| **git-commands** | Daily Git usage, feature workflow, conflict resolution. | [.agent/skills/git-commands/SKILL.md](.agent/skills/git-commands/SKILL.md) |
| **github-workflow** | PR process, main/develop branch strategy. | [.agent/skills/github-workflow/SKILL.md](.agent/skills/github-workflow/SKILL.md) |

## 🏗️ Project Structure
```
arunachala_web/
├── backend/          # FastAPI + SQLAlchemy + Pydantic
├── frontend/         # React + TypeScript + Tailwind
├── infraestructura/  # Docker + PostgreSQL (Configured at root/infraestructura)
├── n8n-workflows/    # AI automation
└── docs/             # Documentation
```

## 📝 Recent Updates (2025-02-04)
- **AI Image Generation**: Fixed routing conflicts (422 error), switched to GET method, improved specific error handling.
- **Dashboard**: Implemented `DashboardActivity` for tracking deleted content.
- **Skills Refactor**: Moved monolithic `AGENTS.md` content into granular skills.