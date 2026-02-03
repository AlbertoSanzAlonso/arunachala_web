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
-   **Models**: Many models (Classes, Therapies, Activities) support a `translations` JSON field.
    ```json
    {
      "ca": { "title": "...", "description": "..." },
      "en": { "title": "...", "description": "..." }
    }
    ```
-   **Auto-Translation**: When content is created in Spanish, background tasks may auto-generate translations using AI if configured.

## 📝 Rules for New Content
1.  Always provide keys in `translation.json` for UI static text.
2.  Interactive content should use the `translations` column in the database.
