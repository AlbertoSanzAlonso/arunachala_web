---
description: Deploy the backend (FastAPI) server locally
---

# Deploy Backend Workflow

This workflow deploys the FastAPI backend server locally for development.

## Prerequisites

1. Ensure Docker is running (for PostgreSQL database)
2. Ensure the virtual environment exists at `/home/albertosanzdev/Projects/arunachala_web/venv`

## Steps

// turbo-all

1. **Start Docker services** (PostgreSQL database)
```bash
cd /home/albertosanzdev/Projects/arunachala_web/infraestructura
docker-compose up -d
```

2. **Wait for database to be ready**
```bash
sleep 5
```

3. **Start the backend server**
```bash
cd /home/albertosanzdev/Projects/arunachala_web/backend
../venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --reload-exclude "docker/*"
```

## Verification

The backend should be accessible at:
- API Documentation: http://localhost:8000/docs
- Health endpoint: http://localhost:8000/api/health

## Troubleshooting

If you encounter a `PermissionError` related to `docker/postgres_data`, ensure the `--reload-exclude "docker/*"` flag is used.
