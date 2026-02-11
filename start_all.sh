#!/bin/bash

echo "🚀 Iniciando todos los servicios de Arunachala Web..."
echo ""

# 1. Iniciar Docker
echo "📦 Paso 1: Iniciando servicios Docker..."
cd /home/albertosanzdev/Projects/arunachala_web/infraestructura
docker-compose up -d
echo "✓ Docker iniciado"
echo ""

# 2. Esperar a que la base de datos esté lista
echo "⏳ Paso 2: Esperando a que la base de datos esté lista..."
sleep 5
echo "✓ Base de datos lista"
echo ""

# 3. Iniciar Backend
echo "🐍 Paso 3: Iniciando Backend (FastAPI)..."
cd /home/albertosanzdev/Projects/arunachala_web/backend
nohup ../venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --reload-exclude "docker/*" > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "✓ Backend iniciado (PID: $BACKEND_PID)"
echo "  Log: /tmp/backend.log"
echo "  URL: http://localhost:8000"
echo ""

# 4. Esperar a que el backend esté listo
echo "⏳ Paso 4: Esperando a que el backend esté listo..."
sleep 5
echo ""

# 5. Iniciar Frontend
echo "⚛️  Paso 5: Iniciando Frontend (React)..."
cd /home/albertosanzdev/Projects/arunachala_web/frontend
nohup npm start > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✓ Frontend iniciado (PID: $FRONTEND_PID)"
echo "  Log: /tmp/frontend.log"
echo "  URL: http://localhost:3000"
echo ""

echo "✅ Todos los servicios iniciados!"
echo ""
echo "📋 Resumen:"
echo "  - Docker: docker-compose ps (en /infraestructura)"
echo "  - Backend: http://localhost:8000/docs"
echo "  - Frontend: http://localhost:3000"
echo "  - Logs Backend: tail -f /tmp/backend.log"
echo "  - Logs Frontend: tail -f /tmp/frontend.log"
echo ""
echo "Para detener los servicios, ejecuta: pkill -f uvicorn && pkill -f 'npm start' && cd infraestructura && docker-compose down"
