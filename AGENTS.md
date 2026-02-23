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
| **deployment-manager** | Hybrid deployment (Vercel/Hetzner) via Coolify + Supabase. | [.agent/skills/deployment-manager/SKILL.md](.agent/skills/deployment-manager/SKILL.md) |

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
├── infraestructura/  # Docker + VPS Config (Hetzner) for n8n & Qdrant
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
## 📝 Recent Updates (2026-02-11 - Afternoon)
- **Site Personalization & Image Handling**:
    - **Advanced Image Cropping**: Integrated `react-easy-crop` in the `SiteCustomization` dashboard. All personalization uploads now trigger a modal for perfect adjustment.
    - **WebP Optimization**: Implemented automatic WebP conversion for all customization images, ensuring high quality with minimal file size.
    - **Dedicated Personalization Table**: Created a new `Personalization` database table to separate visual site settings from general configuration.
    - **Dynamic Identity**: Updated `Header`, `Footer`, and `ChatBot` components to dynamically load the center's logo and bot avatar from the personalization settings.
    - **UI Refinement**: Fine-tuned the Header logo styling for better "breathing room" within its circular container.
- **Responsiveness & Bug Fixes**:
    - **Agent Control Panel**: Fixed layout overflow issues on mobile, making action buttons and day selectors stack correctly.
    - **Content Manager**: Resolved a TypeScript error in content filtering logic.
    - **RAG Stability**: Improved error handling for treatment prices in automated sync tasks.
152: 
153: ## 📝 Recent Updates (2026-02-11 - Late Afternoon)
154: - **UI/UX Consistency & Sliders**:
155:     - **Header Overlap Fix**: Adjusted `BackButton` positioning across all pages (`Yoga`, `Therapies`, `Blog`, `Activities`, `Our Space`, etc.) to resolve visibility issues with the enlarged header. Removed negative margins and standardized absolute offsets.
156:     - **Interactive Content Sliders**: Implemented smooth horizontal scrolling sliders for Blog and Therapy sections. 

## 📝 Recent Updates (2026-02-11 - Late Afternoon)
- **UI/UX Consistency & Sliders**:
    - **Header Overlap Fix**: Adjusted `BackButton` positioning across all pages (`Yoga`, `Therapies`, `Blog`, `Activities`, `Our Space`, etc.) to resolve visibility issues with the enlarged header. Removed negative margins and standardized absolute offsets.
    - **Interactive Content Sliders**: Implemented smooth horizontal scrolling sliders for Blog and Therapy sections. 
        - Added animated arrow navigation for desktop and touch-scroll for mobile.
        - Integrated with dynamic filtering and `i18next` for seamless navigation.
- **Security & System Hygiene**:
    - **Public Registration Closed**: Removed the public `/register` route and secured the registration endpoint. User creation is now restricted to administrators via the dashboard.
    - **Site Personalization**: Refined the "Nuestro Espacio" main image selection to use a fixed, high-quality WebP image from the customization panel instead of the dynamic gallery.
- **Mobile Media Experience**:
    - **Background Audio & Media Session**: Integrated the **Media Session API** in `AudioContext.tsx`. Meditations now continue playing in the background on mobile, with complete lock screen and notification controls (Play, Pause, Next, Previous, Seek) and rich metadata (Title, Artwork).
## 📝 Recent Updates (2026-02-12 - Night)
- **Activity Change Notifications System**:
    - **Multilingual Support**: Implemented a comprehensive notification system (ES/CA/EN) in `activities.py` and `email.py` for new, updated, and deleted activities. 
    - **Smart Templates**: Redesigned email templates with dynamic branding, using `FRONTEND_URL` to automatically load logos and set direct access buttons to activity modals.
    - **Background Execution**: Notifications are processed as asynchronous background tasks to ensure high API performance and prevent UI blocking.
    - **Automatic Triggers**: Integrated notification logic directly into `create_activity`, `update_activity`, `delete_activity`, and `acknowledge_activity_finish` endpoints.
    - **Newsletter & Subscription**: Added `NewsletterForm.tsx` and `UnsubscribePage.tsx` to handle user subscriptions and opt-outs securely.
## 📝 Recent Updates (2026-02-13 - Morning)
- **Frontend Mocking & Vercel Preview**:
    - **Centralized Mock System**: Created `frontend/src/mocks/mockData.ts` containing high-quality sample data for Meditations, Articles, Therapies, and Yoga Schedules.
    - **Offline Fallback Architecture**: Updated core pages (`MeditationsPage`, `AllTherapiesPage`, `YogaSchedule`) and components (`BlogSection`) to automatically switch to mock data if the backend API is unreachable or returns an empty list.
    - **Audio Fail-Safe**: Enhanced `AudioContext` with a global error listener that falls back to a public mock audio stream if the media URL fails to load.
    - **CI/CD Build Fixes**: Resolved ESLint warnings (unused variables, missing dependencies) in `BlogSection` and `UserProfile` that were causing Vercel builds to fail due to `CI=true` enforcement.
    - **Visual Continuity**: Ensured mock items include real Unsplash images and full ES/CA/EN translations to maintain design quality during development cycles without a live backend.
    - **Cleanup Reminder**: All fallback logic is designed as a "safety net" and should be reviewed/removed before the final production release if a persistent backend is guaranteed.

## 📝 Recent Updates (2026-02-13 - Afternoon)
- **RAG & Content Synchronization**:
    - **Promotions Integration**: Added full Retrieve-Augmented Generation (RAG) support for Promotions. 
        - **Auto-Sync**: Creating, updating, or deleting a promotion now instantly triggers a webhook to `n8n`, keeping the AI knowledge base up-to-date.
        - **Rich Metadata**: The sync payload now includes discount codes and percentages in the description context for better AI answers.
        - **Async Processing**: Implemented as non-blocking `async` background tasks in `promotions.py` to maintain API performance.
    - **News (Articles) Confirmation**: Verified and reinforced that all Blog Articles (`content` type) also trigger the RAG sync workflow upon publication, ensuring the chatbot is aware of the latest news.

## 📝 Recent Updates (2026-02-21)
- **Production Infrastructure Migration (Coolify & Supabase)**:
    - **Self-Hosted CI/CD**: Installed and configured **Coolify** on Hetzner VPS (`37.27.4.118`) to manage automated deployments of Backend, n8n, and Qdrant.
    - **Database & Storage Migration**: 
        - Successfully migrated all data (Users, Classes, Therapies, Articles, etc.) from the local Docker Postgres on Hetzner to **Supabase PostgreSQL**.
        - Configured backend to use Supabase Service Role Key for privileged storage access.
        - Updated `DATABASE_URL` to use the direct Supabase connection for production stability.
    - **Supabase Media Storage**:
        - **Audio & Image Optimization**: Updated `upload.py` to handle both audio and images. 
            - Audio: Optimized with `ffmpeg` (mono, normalize, 96k mp3) and uploaded to Supabase Storage.
            - Images: Converted to **WebP**, resized (max 1920px), and uploaded to Supabase Storage.
        - **URL Sanitization**: Fixed an issue where Supabase public URLs included a trailing `?`, ensuring clean direct links for the frontend.
    - **Legacy Cleanup**: Completely removed old manual Docker containers and Caddy proxy on Hetzner to prevent port conflicts.
    - **System Dependencies**: Added `ffmpeg` to the Docker image for on-the-fly audio processing.

## 📝 Recent Updates (2026-02-21 - Afternoon)
- **Image URL Standardization (`getImageUrl` rollout)**:
    - **Root Cause**: Images were broken because manual `${API_BASE_URL}${url}` concatenation was being applied to already-absolute Supabase URLs, producing malformed URLs like `api.yogayterapiasarunachala.eshttps//supabase.co/...`.
    - **Fix**: Completed the rollout of `getImageUrl` (`src/utils/imageUtils.ts`) across ALL remaining components: `YogaPage`, `AboutPage`, `UserProfile`, `UserManager`, `ContentManager`, `GalleryManager`.
    - **`getImageUrl` contract**: If URL starts with `http`, return as-is. Otherwise prepend `API_BASE_URL`. Handles both Supabase absolute URLs and local `/static/...` paths transparently.

- **Supabase Storage Fix**:
    - **Root Cause**: `SUPABASE_KEY` in Coolify was the **Publishable key** (`sb_publishable_...`) — read-only. Image uploads require the **Service Role JWT** (`eyJ...`).
    - **Fix**: Updated `backend/.env` and `infraestructura/.env`. Must also update `SUPABASE_KEY` in Coolify and redeploy the backend.

- **Chatbot Diagnosis & Fix**:
    - **Root Cause**: Coolify was missing `GROQ_API_KEY` / `OPENAI_API_KEY`. Backend returned JSON instead of SSE stream (no AI provider available).
    - **Frontend fix**: `ChatBot.tsx` now detects `content-type: application/json` responses and displays the message directly instead of crashing into the Puter.js fallback (which gives 401).
    - **Required action**: Add `GROQ_API_KEY` in Coolify. Change `chatbot_model` to "groq" in Dashboard → Agent Config.

- **Media Session API Improvements** (`AudioContext.tsx`):
    - Fixed artwork MIME type: was hardcoded `image/png`, now detects `.webp`/`.png`/`.jpg` from URL dynamically.
    - Added `setPositionState()` in `timeupdate` handler → lock screen progress bar updates in real time.
    - Added `seekbackward` / `seekforward` handlers (±10s) for headphone button support.

- **Mobile Audio File Input** (`ContentManager.tsx`):
    - Changed `accept="audio/*"` → explicit MIME types + extensions to force Android to open the Files app instead of Gallery or Recorder.

- **Vercel CI Build Fix**:
    - Orphaned `import { API_BASE_URL }` in `GalleryManager.tsx` was causing ESLint `no-unused-vars` error that broke all Vercel deployments (`CI=true` treats warnings as errors).
    - Fix: Removed the unused import.

## 📝 Recent Updates (2026-02-23)
- **Async Concurrency & Redis Caching**:
    - **Database Layer Upgrade**: Initiated the migration to asynchronous database operations by integrating `asyncpg` and async SQLAlchemy sessions (starting with essential background tasks and health checks) to allow the FastAPI server to handle significantly more concurrent connections without blocking.
    - **Redis Cache Integration**:
        - Deployed a standalone authenticated **Redis 7** service in the production Hetzner/Coolify environment.
        - Created a robust caching module (`app/core/redis_cache.py`) with configurable Time-To-Live (TTLs) and a graceful **fallback mode** (if Redis becomes unavailable, the app seamlessly defaults to direct database queries without crashing).
    - **Chatbot Performance Optimization**:
        - Caching has been aggressively applied to the RAG Chatbot's most expensive operations: `get_inventory_summary` (counting & aggregating all site activities per language) gets a 5-minute TTL, and active Agent configs get a 10-minute TTL.
        - This dramatically reduces the load on the Supabase Postgres instance on every user interaction.
        - **Smart Cache Invalidation**: Webhooks in `content.py` and `webhooks.py` perform real-time cache pattern invalidation (`inventory:*`) whenever new activities or content are saved, ensuring the AI never serves stale information despite the caching layer.

- **Vercel CI Build Fix (ESLint)**:
    - Fixed a build failure caused by an unused `handleLinkClick` function in `Header.tsx`. 
    - Verified the fix by running a local build with `CI=true`.
