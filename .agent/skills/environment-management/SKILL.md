---
name: environment-management
description: Instructions for managing and running the development environments (Frontend & Backend).
---

# Environment Management Skill

This skill provides strict guidelines on how to run, manage, and troubleshoot the development environments for the Arunachala Web project.

## 🏗️ Project Structure Context

The project is a monorepo with distinct environments:

- **Root (`/`)**: Contains the global Python virtual environment (`venv`).
- **Backend (`/backend`)**: Python FastAPI application. **DOES NOT** should have its own `venv` (use the root one).
- **Frontend (`/frontend`)**: React application. Has its own `node_modules`.

## 🚀 Running the Applications

### 🐍 Backend (FastAPI)

**CRITICAL**: The virtual environment is located at the project root (`/venv`). Do NOT try to create or use `backend/venv`.

**Correct Command:**
From the `/backend` directory:
```bash
../venv/bin/uvicorn app.main:app --reload
```

**Setup/Install Dependencies:**
If you need to install new python packages:
```bash
# From root or backend (adjust path to pip accordingly)
/path/to/root/venv/bin/pip install -r backend/requirements.txt
```

### ⚛️ Frontend (React)

**Correct Command:**
From the `/frontend` directory:
```bash
npm start
```

**Setup/Install Dependencies:**
From the `/frontend` directory:
```bash
npm install
```

## ⚠️ Common Pitfalls & Rules

1.  **Do NOT create `backend/venv`**: If you see it, it is likely invalid or a mistake. Always default to the root `venv`.
2.  **AbsolutePath Execution**: When in doubt, use absolute paths to the python executable in the root venv to ensure you are using the correct environment.
3.  **Docker Conflicts**: The database runs in Docker. Ensure ports (usually 5432) are free or Docker is running correctly if DB connection fails.
