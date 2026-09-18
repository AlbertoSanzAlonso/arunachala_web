#!/usr/bin/env bash
# Migra Postgres de Supabase (PG17) → Postgres 17 en el VPS.
#
# Uso:
#   export SUPABASE_DB_URL='postgresql://postgres:PASS%21@db.REF.supabase.co:5432/postgres?sslmode=require'
#   ./migrate_db_supabase_to_local.sh
#
# Si no existe el contenedor destino, se crea `arunachala-postgres` (Postgres 17)
# en la red coolify, SIN tocar infraestructura-postgres-1 (n8n).

set -euo pipefail

DUMP_FILE="${DUMP_FILE:-/tmp/arunachala_supabase_$(date +%Y%m%d_%H%M%S).dump}"
LOCAL_PG_CONTAINER="${LOCAL_PG_CONTAINER:-arunachala-postgres}"
LOCAL_DB_NAME="${LOCAL_DB_NAME:-arunachala_web}"
LOCAL_DB_USER="${LOCAL_DB_USER:-arunachala}"
LOCAL_DB_PASSWORD="${LOCAL_DB_PASSWORD:-arunachala1234}"
PG_IMAGE="${PG_IMAGE:-postgres:17}"
COOLIFY_NETWORK="${COOLIFY_NETWORK:-coolify}"

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "❌ Define SUPABASE_DB_URL (Direct :5432). Codifica ! como %21"
  exit 1
fi

if [[ "$SUPABASE_DB_URL" == *":6543"* ]]; then
  echo "⚠️  Puerto 6543 (transaction pooler) no sirve para pg_dump. Usa :5432."
  exit 1
fi

echo "=== 1) Postgres local (PG17) ==="
if ! docker ps --format '{{.Names}}' | grep -qx "$LOCAL_PG_CONTAINER"; then
  if docker ps -a --format '{{.Names}}' | grep -qx "$LOCAL_PG_CONTAINER"; then
    echo "▶ Arrancando $LOCAL_PG_CONTAINER..."
    docker start "$LOCAL_PG_CONTAINER"
  else
    echo "▶ Creando $LOCAL_PG_CONTAINER ($PG_IMAGE) en red $COOLIFY_NETWORK..."
    docker volume create arunachala_pg17_data >/dev/null
    docker run -d \
      --name "$LOCAL_PG_CONTAINER" \
      --restart unless-stopped \
      --network "$COOLIFY_NETWORK" \
      -e POSTGRES_USER="$LOCAL_DB_USER" \
      -e POSTGRES_PASSWORD="$LOCAL_DB_PASSWORD" \
      -e POSTGRES_DB="$LOCAL_DB_NAME" \
      -v arunachala_pg17_data:/var/lib/postgresql/data \
      "$PG_IMAGE"
    echo "▶ Esperando a que Postgres acepte conexiones..."
    for i in $(seq 1 30); do
      if docker exec -e PGPASSWORD="$LOCAL_DB_PASSWORD" "$LOCAL_PG_CONTAINER" \
        pg_isready -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" >/dev/null 2>&1; then
        break
      fi
      sleep 1
    done
  fi
fi

docker network connect "$COOLIFY_NETWORK" "$LOCAL_PG_CONTAINER" 2>/dev/null || true

echo "=== 2) Dump Supabase con $PG_IMAGE → $DUMP_FILE ==="
docker run --rm --network host \
  -v /tmp:/tmp \
  "$PG_IMAGE" \
  pg_dump "$SUPABASE_DB_URL" \
    --format=custom \
    --no-owner \
    --no-acl \
    --schema=public \
    -f "$DUMP_FILE"

ls -lh "$DUMP_FILE"

echo "=== 3) Asegurar BD $LOCAL_DB_NAME ==="
docker exec -e PGPASSWORD="$LOCAL_DB_PASSWORD" "$LOCAL_PG_CONTAINER" \
  psql -U "$LOCAL_DB_USER" -d postgres -tc \
  "SELECT 1 FROM pg_database WHERE datname='${LOCAL_DB_NAME}'" | grep -q 1 \
  || docker exec -e PGPASSWORD="$LOCAL_DB_PASSWORD" "$LOCAL_PG_CONTAINER" \
       psql -U "$LOCAL_DB_USER" -d postgres -c "CREATE DATABASE ${LOCAL_DB_NAME} OWNER ${LOCAL_DB_USER};"

echo "=== 4) Restore ==="
docker cp "$DUMP_FILE" "$LOCAL_PG_CONTAINER:/tmp/arunachala.dump"
docker exec -e PGPASSWORD="$LOCAL_DB_PASSWORD" "$LOCAL_PG_CONTAINER" \
  pg_restore -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" \
    --no-owner --no-acl --clean --if-exists \
    /tmp/arunachala.dump || true

echo "=== 5) Verificación ==="
docker exec -e PGPASSWORD="$LOCAL_DB_PASSWORD" "$LOCAL_PG_CONTAINER" \
  psql -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" -c "\dt"
docker exec -e PGPASSWORD="$LOCAL_DB_PASSWORD" "$LOCAL_PG_CONTAINER" \
  psql -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" -c "SELECT COUNT(*) AS contents FROM contents;"

echo ""
echo "✅ Listo."
echo "Coolify DATABASE_URL="
echo "  postgresql://${LOCAL_DB_USER}:${LOCAL_DB_PASSWORD}@${LOCAL_PG_CONTAINER}:5432/${LOCAL_DB_NAME}"
echo "Redeploy del API y comprueba /api/content."
