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
- **RAG Sync System 2.0**: Implemented robust tracking with `rag_sync_log` table, automatic synchronization with n8n (bidirectional), and a new RAG Knowledge Center in the Agent Dashboard for monitoring.
- **RAG Stability Improvements**: 
    - Fixed "JSON parameter needs to be valid JSON" by ensuring no null values in text fields. 
    - Improved webhook reliability by using independent DB sessions and passing entity data (vector_id) before deletion to avoid 404s.
    - Updated `rag.py` to support `article` alias for `content` entity types, resolving n8n "Unknown entity type" errors.
    - Fixed Docker networking: Backend now accessible via `http://172.17.0.1:8000` from n8n containers.
- **Auto-Image & Memory**:
    - **Automatic RAG Activation**: Publishing content (`status='published'`) now reliably triggers n8n sync automatically.
    - **Remote Image Download**: Remote `thumbnail_url`s (e.g. from AI) are now auto-downloaded to `/static/articles/` with SEO-friendly filenames upon saving. Download headers updated to mimic real browsers ("Mozilla/5.0") to prevent 403 blocks from external providers.
- **UX Blocking Loader**: Implemented a global `PageLoader` (rotating lotus) across all dashboard managers (Treatments, Classes, Schedule, Activities, Users, Content) to prevent duplicate submissions and double-click errors.
- **AI Image Generation**: Switched to GET method, improved error handling, and integrated with the new content manager flow.
## 🔐 Credentials
- **Test User**: `albertosanzdev@gmail.com`
- **Password**: `Albertito_23`

## 📝 Recent Updates (2026-02-06)
- **Multilingual Chatbot & Design**:
    - **Dynamic Language Support**: Chatbot now detects and switches language instantly (ES/CA/EN), updating greetings and interface texts via `useTranslation`.
    - **Backend Integration**: Language context is sent to backend, ensuring AI responses match the user's selected language. removed source citations from chat responses for cleaner output.
    - **Translation Fixes**: Corrected broken JSON structures in locale files (`es/translation.json`, `ca/translation.json`, `en/translation.json`) to fix build errors.
- **Backend Image Optimization**:
    - **WebP Conversion**: Implemented automatic conversion of remote images to WebP format in `webhooks.py` when saving articles, improving performance and SEO.
- **UI/UX Redesign (Header & Footer)**:
    - **New Palette**: Updated Header and Footer to use the brand's primary Olive Green (`#5c6b3c`) background and Bone/Beige (`#F5F5DC`) text.
    - **Logo Styling**: Replaced transparent logo with `logo_icon.webp`, styled as a circular avatar with bone-colored border (`rounded-full border-[#F5F5DC]`).
    - **Mobile Menu**: Aligned mobile menu colors with the new design theme.

## 📝 Recent Updates (2026-02-07)
- **Advanced Blog Features**:
    - **Smart Search Component**: Created `BlogSearch.tsx` with unified search capabilities:
        - **Autocomplete**: Real-time suggestions when typing.
        - **Hierarchical Date Filter**: Filter by Year -> Month (YYYY-MM).
        - **Tag Cloud**: Dynamic, selectable tag cloud filter (based on translated tags).
        - **Category Tabs**: Integrated category navigation (Yoga/Therapy/All).
    - **Pagination**: Implemented client-side pagination (9 items per page) with auto-scroll to top on navigation.
    - **Tag Translations**: Fixed issue where tags were not displaying in the selected language. Now all tags (List, Detail, Modal) respect `i18n.language`.
    - **Backend Improvements**: Cleaned up legacy `sqlite` remnants to ensure strict PostgreSQL usage.
