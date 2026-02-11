#!/bin/bash

echo "=== Verificando servicios de Arunachala Web ==="
echo ""

echo "1. Docker containers:"
cd /home/albertosanzdev/Projects/arunachala_web/infraestructura
docker-compose ps
echo ""

echo "2. Backend (puerto 8000):"
if lsof -i :8000 > /dev/null 2>&1; then
    echo "✓ Backend está corriendo en el puerto 8000"
    curl -s http://localhost:8000/api/health | head -20
else
    echo "✗ Backend NO está corriendo en el puerto 8000"
fi
echo ""

echo "3. Frontend (puerto 3000):"
if lsof -i :3000 > /dev/null 2>&1; then
    echo "✓ Frontend está corriendo en el puerto 3000"
else
    echo "✗ Frontend NO está corriendo en el puerto 3000"
fi
echo ""

echo "4. Procesos uvicorn:"
ps aux | grep uvicorn | grep -v grep || echo "No hay procesos uvicorn corriendo"
echo ""

echo "5. Procesos node/npm:"
ps aux | grep -E "node|npm" | grep -v grep | head -5 || echo "No hay procesos node/npm corriendo"
