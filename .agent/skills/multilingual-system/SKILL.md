---
name: multilingual-system
description: Guidelines for managing the multilingual (ES/CA/EN) support.
---

# Multilingual System Skill

This project supports Spanish (ES), Catalan (CA), and English (EN).

## 🌐 Implementation Details

### Frontend (React)
-   **Library**: `i18next` with `react-i18next`.
-   **Files**: `src/locales/{lang}/translation.json`.
-   **Auto-detection**: Attempts to detect browser language, falls back to Spanish (`es`).

### Backend (Database)
-   **Models**: Many models (Classes, Therapies, Activities, Articles, Meditations) support a `translations` JSON field.
    ```json
    {
      "ca": { "title": "...", "description": "..." },
      "en": { "title": "...", "description": "..." }
    }
    ```
-   **Auto-Translation Reliability**: AI translation tasks (`translation_utils.py`) are strictly configured to use global Pydantic settings. Avoid using local `load_dotenv()` in individual scripts; ensure `OPENAI_API_KEY` is present in the main environment (Coolify).
-   **Manual Corrections**: Content with missing translations can be re-saved in the Dashboard to force a re-trigger of the automated background translation.

## 📝 Rules for New Content
1.  Always provide keys in `translation.json` for UI static text.
2.  Interactive content should use the `translations` column in the database.
