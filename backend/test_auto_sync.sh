#!/bin/bash
# Script para verificar que el webhook RAG se dispara automáticamente al crear Activities

echo "═══════════════════════════════════════════════════════════════"
echo "🧪 TEST: Verificación de Auto-Sync de Activities a RAG"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1️⃣  Verificando configuración...${NC}"
echo ""

# Verifica que los servicios estén corriendo
echo "Verificando Backend (port 8000)..."
if curl -s http://localhost:8000/api/activities > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend está corriendo${NC}"
else
    echo -e "${RED}❌ Backend NO está corriendo en http://localhost:8000${NC}"
    echo "   Inicia el backend: cd backend && python3 -m uvicorn app.main:app --reload"
    exit 1
fi

echo ""
echo "Verificando N8N Webhook..."
if curl -s -X POST http://localhost:5678/webhook/arunachala-rag-update \
  -H "Content-Type: application/json" \
  -d '{"test": true}' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ N8N Webhook está activo${NC}"
else
    echo -e "${RED}❌ N8N Webhook NO responde en http://localhost:5678${NC}"
    echo "   Verifica que n8n está corriendo y el webhook está ACTIVO"
    exit 1
fi

echo ""
echo "Verificando Qdrant..."
if curl -s http://localhost:6333/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Qdrant está activo${NC}"
else
    echo -e "${RED}❌ Qdrant NO está activo en http://localhost:6333${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}2️⃣  Preparando test de Activity...${NC}"
echo ""

# Generamos un timestamp único para la actividad
TIMESTAMP=$(date +%s)
ACTIVITY_TITLE="Test Auto-Sync Activity $TIMESTAMP"
ACTIVITY_SLUG="test-auto-sync-$TIMESTAMP"

echo "Título: $ACTIVITY_TITLE"
echo "Slug: $ACTIVITY_SLUG"
echo ""

# Espera un poco para que el usuario vea la info
sleep 2

echo -e "${BLUE}3️⃣  Creando Activity vía API...${NC}"
echo ""

# Token JWT válido (necesitas estar autenticado)
# Si no tienes un token, el servidor devolverá 401
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbGJlcnRvc2FuemRldkBnbWFpbC5jb20iLCJleHAiOjk5OTk5OTk5OTl9.WH_Zd9SsGMrGHw-UR8Nz0sXxW6gPYhVwLYBjF5oALFc"

RESPONSE=$(curl -s -X POST http://localhost:8000/api/activities \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=$ACTIVITY_TITLE" \
  -F "description=Esta es una actividad de prueba para verificar el sync automático con RAG" \
  -F "type=taller" \
  -F "is_active=true")

echo "Response: $RESPONSE"
echo ""

# Extrae el ID de la actividad si fue creada
ACTIVITY_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')

if [ -z "$ACTIVITY_ID" ]; then
    echo -e "${RED}❌ Error creando Activity - verifica el token y que el usuario sea admin${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Activity creada con ID: $ACTIVITY_ID${NC}"
echo ""

echo -e "${BLUE}4️⃣  Esperando procesamiento en n8n (5 segundos)...${NC}"
sleep 5
echo ""

echo -e "${BLUE}5️⃣  Verificando RAG Sync Status...${NC}"
echo ""

# Obtén el status del RAG
RAG_STATUS=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/rag/sync-status)
echo "RAG Status: $RAG_STATUS"
echo ""

# Busca logs de la actividad
echo -e "${BLUE}6️⃣  Buscando logs de sincronización...${NC}"
echo ""

RAG_LOGS=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/rag/sync-logs)
echo "RAG Logs (últimos 3):"
echo "$RAG_LOGS" | head -100

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ Test completado"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📝 Próximos pasos:"
echo "1. Verifica en n8n si viste una ejecución del workflow"
echo "2. Verifica en el dashboard: Agent Control → RAG Status"
echo "3. Busca la Activity en el chatbot"
echo ""
