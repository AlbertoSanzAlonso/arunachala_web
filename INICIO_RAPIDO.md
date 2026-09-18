# 🚀 Inicio Rápido - Arunachala Web

 Para iniciar el entorno de desarrollo local (Docker para servicios auxiliares + Backend + Frontend), simplemente ejecuta:

```bash
./start_dev.sh
```

Este script:
- ✅ Verifica que Docker esté corriendo (para n8n y Qdrant locales)
- ✅ Inicia los servicios auxiliares (n8n, Qdrant)
- ✅ Verifica que los puertos 8000 y 3000 estén libres
- ✅ Abre terminales automáticas para Backend y Frontend

### URLs de Acceso

Una vez iniciado, podrás acceder a:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **Base de Datos**: Postgres en el VPS (`arunachala-postgres`)

### Detener los Servicios

Para detener los servicios:

1. **Backend y Frontend**: Cierra las terminales o presiona `Ctrl+C` en cada una
2. **Docker**:
   ```bash
   cd infraestructura
   docker-compose down
   ```

## Solución de Problemas

### El puerto 8000 o 3000 ya está en uso

El script te preguntará si quieres detener el proceso que está usando el puerto. Responde `s` (sí) para liberarlo automáticamente.

### Docker no está corriendo

Asegúrate de iniciar Docker Desktop antes de ejecutar el script.

### No se encuentra el emulador de terminal

Si el script no puede abrir terminales automáticamente, ejecuta manualmente:

**Terminal 1 - Backend:**
```bash
cd ~/Projects/arunachala_web/backend
../venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd ~/Projects/arunachala_web/frontend
npm start
```

## Estructura del Proyecto

```
arunachala_web/
├── backend/          # FastAPI (Python)
├── frontend/         # React (TypeScript)
├── infraestructura/  # Docker Compose (PostgreSQL, NocoDB, n8n)
├── venv/            # Virtual environment de Python (raíz)
└── start_dev.sh     # Script de inicio rápido
```

## Notas Importantes

- El virtual environment de Python está en la **raíz del proyecto** (`/venv`), no en `/backend/venv`
- Asegúrate de tener instaladas todas las dependencias:
  - Backend: `pip install -r backend/requirements.txt`
  - Frontend: `cd frontend && npm install`
