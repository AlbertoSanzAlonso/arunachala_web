#!/bin/bash

# Script para iniciar el entorno de desarrollo de Arunachala Web
# Uso: ./start_dev.sh

echo "🚀 Iniciando Arunachala Web - Entorno de Desarrollo"
echo "=================================================="
echo ""

# Colores para mejor visualización
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para verificar si un puerto está en uso
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# 1. Verificar Docker
echo -e "${YELLOW}📦 Verificando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker no está corriendo. Por favor, inicia Docker primero.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker está corriendo${NC}"
echo ""

# 2. Iniciar servicios Docker (PostgreSQL)
echo -e "${YELLOW}📦 Iniciando servicios Docker (PostgreSQL)...${NC}"
cd /home/albertosanzdev/Projects/arunachala_web/infraestructura
docker-compose up -d
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Servicios Docker iniciados${NC}"
else
    echo -e "${RED}❌ Error al iniciar Docker${NC}"
    exit 1
fi
echo ""

# 3. Esperar a que PostgreSQL esté listo
echo -e "${YELLOW}⏳ Esperando a que PostgreSQL esté listo...${NC}"
sleep 5
echo -e "${GREEN}✓ PostgreSQL listo${NC}"
echo ""

# 4. Verificar si el puerto 8000 está libre
if check_port 8000; then
    echo -e "${YELLOW}⚠️  El puerto 8000 ya está en uso. ¿Quieres detener el proceso? (s/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([sS][iI]|[sS])$ ]]; then
        lsof -ti:8000 | xargs kill -9
        echo -e "${GREEN}✓ Puerto 8000 liberado${NC}"
    else
        echo -e "${RED}❌ No se puede iniciar el backend en el puerto 8000${NC}"
        exit 1
    fi
fi

# 5. Verificar si el puerto 3000 está libre
if check_port 3000; then
    echo -e "${YELLOW}⚠️  El puerto 3000 ya está en uso. ¿Quieres detener el proceso? (s/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([sS][iI]|[sS])$ ]]; then
        lsof -ti:3000 | xargs kill -9
        echo -e "${GREEN}✓ Puerto 3000 liberado${NC}"
    else
        echo -e "${RED}❌ No se puede iniciar el frontend en el puerto 3000${NC}"
        exit 1
    fi
fi
echo ""

# 6. Abrir terminales para Backend y Frontend
echo -e "${YELLOW}🐍 Abriendo terminal para Backend...${NC}"
echo -e "${YELLOW}⚛️  Abriendo terminal para Frontend...${NC}"
echo ""

# Detectar el emulador de terminal disponible
if command -v gnome-terminal &> /dev/null; then
    TERMINAL="gnome-terminal"
elif command -v konsole &> /dev/null; then
    TERMINAL="konsole"
elif command -v xfce4-terminal &> /dev/null; then
    TERMINAL="xfce4-terminal"
elif command -v xterm &> /dev/null; then
    TERMINAL="xterm"
else
    echo -e "${RED}❌ No se encontró un emulador de terminal compatible${NC}"
    echo -e "${YELLOW}Por favor, ejecuta manualmente en terminales separadas:${NC}"
    echo ""
    echo "Terminal 1 (Backend):"
    echo "  cd ~/Projects/arunachala_web/backend"
    echo "  ../venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
    echo ""
    echo "Terminal 2 (Frontend):"
    echo "  cd ~/Projects/arunachala_web/frontend"
    echo "  npm start"
    exit 0
fi

# Abrir terminal para Backend
if [ "$TERMINAL" = "gnome-terminal" ]; then
    gnome-terminal --tab --title="Backend (FastAPI)" -- bash -c "cd /home/albertosanzdev/Projects/arunachala_web/backend && echo '🐍 Iniciando Backend...' && ../venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload; exec bash"
    gnome-terminal --tab --title="Frontend (React)" -- bash -c "cd /home/albertosanzdev/Projects/arunachala_web/frontend && echo '⚛️  Iniciando Frontend...' && npm start; exec bash"
elif [ "$TERMINAL" = "konsole" ]; then
    konsole --new-tab -e bash -c "cd /home/albertosanzdev/Projects/arunachala_web/backend && echo '🐍 Iniciando Backend...' && ../venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload; exec bash" &
    konsole --new-tab -e bash -c "cd /home/albertosanzdev/Projects/arunachala_web/frontend && echo '⚛️  Iniciando Frontend...' && npm start; exec bash" &
else
    $TERMINAL -e "cd /home/albertosanzdev/Projects/arunachala_web/backend && ../venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload" &
    $TERMINAL -e "cd /home/albertosanzdev/Projects/arunachala_web/frontend && npm start" &
fi

echo ""
echo -e "${GREEN}✅ Entorno de desarrollo iniciado!${NC}"
echo ""
echo "📋 URLs de acceso:"
echo "  🌐 Frontend:  http://localhost:3000"
echo "  🔧 Backend:   http://localhost:8000"
echo "  📚 API Docs:  http://localhost:8000/docs"
echo ""
echo "Para detener los servicios:"
echo "  - Cierra las terminales del Backend y Frontend (Ctrl+C)"
echo "  - Ejecuta: cd infraestructura && docker-compose down"
echo ""
