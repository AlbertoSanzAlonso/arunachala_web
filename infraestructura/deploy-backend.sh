#!/usr/bin/env bash
# Reconstruye y reinicia solo el backend en producción (fix scheduler / workers).
set -euo pipefail

cd "$(dirname "$0")"
COMPOSE_FILE="docker-compose.prod.yml"

echo "=========================================="
echo "  Despliegue del backend (Arunachala)"
echo "=========================================="

if ! command -v docker >/dev/null 2>&1; then
  echo "❌ No encuentro Docker instalado."
  echo "   En tu PC: abre Docker Desktop y vuelve a ejecutar este script."
  echo "   En el servidor (Hetzner): instala Docker o conéctate por SSH al VPS."
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  DC="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  DC="docker-compose"
else
  echo "❌ Docker está instalado pero falta 'docker compose' o 'docker-compose'."
  exit 1
fi

echo ""
echo "▶ Reconstruyendo imagen del backend (puede tardar 1-3 minutos)..."
$DC -f "$COMPOSE_FILE" build backend

echo ""
echo "▶ Reiniciando contenedor backend..."
$DC -f "$COMPOSE_FILE" up -d backend

echo ""
echo "▶ Últimas líneas del log (comprueba el scheduler):"
$DC -f "$COMPOSE_FILE" logs backend --tail 30

echo ""
echo "✅ Listo."
echo ""
echo "Deberías ver UNA línea como:"
echo "   📅 Scheduler enabled on worker pid=..."
echo "y varias como:"
echo "   ⏭️ Automation Scheduler disabled in this worker process"
echo ""
echo "Si no aparecen, espera 10 segundos y ejecuta:"
echo "   $DC -f $COMPOSE_FILE logs backend --tail 50"
