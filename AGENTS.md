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
## 📝 Recent Updates (2026-02-07 - Afternoon)
- **Tag Management & Search Refinement**:
    - **Data Normalization**: Migrated legacy article categories ('general', 'Ayurveda', etc.) to 'yoga' or 'therapy' for better alignment with the studio's focus.
    - **Tag Translation System**: Implemented automated background translation for all tags into English and Catalan, ensuring consistent metadata across languages.
    - **Enhanced Search UX**: Refactored `MeditationSearch` and `BlogSearch` with a custom suggestions dropdown:
        - Prevents accidental auto-completion on "Enter" to preserve partial word searches.
        - Implements accent-insensitive and case-insensitive matching for titles and tags.
        - Uses smooth Framer Motion animations for the suggestions menu.
    - **RAG for Articles & Meditations**: Fully integrated Articles and Meditations into the RAG system, ensuring they are searchable by the AI assistant with automatic synchronization upon publication.
    - **Tag Synchronization**: Re-synchronized all existing content tags with the `Tag` table to fix missing items in the search clouds.

## 📝 Recent Updates (2026-02-09)
- **AI Model Optimization & Cost Management**:
    - **Dual Model Strategy**: Implemented separate model selection for the Wellness Quiz (defaults to **Groq/Llama3** for speed/zero cost) and the main Chatbot (defaults to **OpenAI/GPT-4o** for quality/reasoning).
    - **Unified Priority Logic**: Backend now strictly prioritizes user configuration -> Groq -> OpenAI -> Gemini, ensuring predictable model usage.
    - **Dashboard Control**: Added new UI controls in `AgentControl` to independently select models for Quiz vs Chatbot.

- **Wellness Quiz & Navigation Fixes**:
    - **Smart URL Handling**: 
        - **Backend**: Implemented `get_inventory_summary` to pre-calculate correct, relative URLs for all items (Yoga, Massages, Meditations).
        - **Prompt Engineering**: Enforced strict "copy-paste" rules for the AI to prevent internal URL hallucination (no more `localhost` links).
        - **Sanitization**: Added a backend safety filter `clean_ai_response` that strips any absolute URLs before sending response to client.
    - **Meditation Player Integration**:
        - **Auto-Play**: Meditation links from the Quiz (`/meditaciones/slug`) now automatically open the player modal.
        - **New Tab Experience**: All recommendations from the Quiz now open in a new tab (`target="_blank"`) to preserve the user's results.
        - **Focused UI**: Improved modal accessibility by setting the initial focus to the "Play" button, ensuring the "Close" (X) button is present but not automatically highlighted upon opening.

## 📝 Recent Updates (2026-02-09 - Evening)
- **Meditation Player & UI Refinement**:
    - **Stability Fixes**: Resolved "Element type is invalid" error in `MeditationsPage` by fixing duplicate exports in `MeditationPlayerModal` and converting core player components from `lazy` to standard imports in `App.tsx`.
    - **Audio Engine Refactor**: Updated `AudioContext` to use `useRef` for playlist and current meditation state, ensuring event listeners (like `ended`) always have access to the most up-to-date state without closure staleness.
    - **Header Enhancements**:
        - **Desktop Mini-Player**: Redesigned as a compact "pill" with groups for controls, info, and actions. Added a smooth, animated volume slider that expands on hover using `framer-motion`.
        - **Mobile Player**: Improved the compact version by adding direct Play/Pause and Expand buttons, ensuring quicker access to controls.
    - **Clean UI**: Removed the redundant language switcher from the mobile slide-out menu to prioritize navigation space.
- **Git & Agent Maintenance**: Performed a full project commit, pull, and state synchronization.

## 📝 Recent Updates (2026-02-09 - Night)
- **Interactive Voting System**:
    - **Backend Realignment**: Restored stable API routing for `/api/suggestions`, fixed critical model imports in `activities.py`, and ensured 100% database data integrity with `delete-orphan` cascades (deleting an activity now automatically cleans up all associated votes/comments).
    - **Frontend UX**: Implemented a "Vote Again" feature to allow users to change or add votes, and added clear success feedback.
- **Context-Aware Audio Player (UX)**:
    - **Smart Visibility**: Introduced `isMeditationInView` logic in `AudioContext`. The Header's mini-player now automatically hides with a smooth animation if the meditation currently playing is visible on the current page (including pagination support), preventing UI clutter.
- **Mobile-First Design (Activities Page)**:
    - **Overflow Fixes**: Redesigned the suggestion questionnaire specifically for small screens. Reduced container paddings, optimized button layouts, and adjusted border-radii to ensure a perfect fit on mobile devices without horizontal scrolling.
- **System Maintenance**:
    - **Translations**: Standardized `common.loading` and `common.sending` keys across ES/CA/EN locales to eliminate hydration warnings and console errors.
    - **API Stability**: Resolved backend server process conflicts and ensured stable endpoint availability.

## 📝 Recent Updates (2026-02-11)
- **Dependency Compatibility**:
    - **FastAPI/Pydantic Fix**: Updated backend to use FastAPI >= 0.109.0 with Pydantic >= 2.7.4 to resolve `'FieldInfo' object has no attribute 'in_'` errors.
    - **Environment Management**: Enhanced skill documentation with version pinning guidance and troubleshooting steps for dependency conflicts.
- **Local Deployment**:
    - **Docker Infrastructure**: Verified all containers (PostgreSQL, n8n, Qdrant, NocoDB, Portainer) running successfully on standard ports.
    - **Development Servers**: Both Frontend (React) and Backend (FastAPI) running stably with hot-reload enabled.


