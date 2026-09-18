#!/usr/bin/env bash
# Migra Postgres de Supabase → Postgres del VPS (Coolify / docker).
#
# Uso (en el VPS, como root):
#   export SUPABASE_DB_URL='postgresql://postgres.REF:PASS@db.REF.supabase.co:5432/postgres'
#   # Opcional: URL destino (por defecto crea arunachala_web en el postgres local)
#   export LOCAL_DB_URL='postgresql://arunachala:PASS@infraestructura-postgres-1:5432/arunachala_web'
#   ./migrate_db_supabase_to_local.sh
#
# Importante:
#   - Usa conexión DIRECTA de Supabase (puerto 5432 / host db.xxx.supabase.co),
#     NO el pooler :6543 (pg_dump falla o queda incompleto).
#   - NO restaura sobre la misma BD que usa n8n si ya hay datos ahí.
#     Por defecto crea/usa la BD `arunachala_web`.

set -euo pipefail

DUMP_FILE="${DUMP_FILE:-/tmp/arunachala_supabase_$(date +%Y%m%d_%H%M%S).dump}"
LOCAL_PG_CONTAINER="${LOCAL_PG_CONTAINER:-infraestructura-postgres-1}"
LOCAL_DB_NAME="${LOCAL_DB_NAME:-arunachala_web}"
LOCAL_DB_USER="${LOCAL_DB_USER:-arunachala}"
LOCAL_DB_PASSWORD="${LOCAL_DB_PASSWORD:-arunachala1234}"

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "❌ Define SUPABASE_DB_URL (conexión directa :5432, no pooler :6543)"
  echo "   En Supabase → Project Settings → Database → Connection string → URI (Direct)"
  exit 1
fi

if [[ "$SUPABASE_DB_URL" == *":6543"* ]] || [[ "$SUPABASE_DB_URL" == *"pooler.supabase.com"* ]]; then
  echo "⚠️  Parece URL de pooler. Para pg_dump usa Direct connection (db.xxx.supabase.co:5432)."
  echo "   Continuar igual puede fallar. Ctrl+C para abortar, Enter para seguir."
  read -r _
fi

echo "=== 1) Comprobar contenedor Postgres local ==="
if ! docker ps --format '{{.Names}}' | grep -qx "$LOCAL_PG_CONTAINER"; then
  echo "❌ No encuentro contenedor '$LOCAL_PG_CONTAINER'"
  echo "   Contenedores postgres:"
  docker ps --format '{{.Names}}' | grep -i postgres || true
  exit 1
fi

echo "=== 2) Dump desde Supabase → $DUMP_FILE ==="
# Usamos la imagen postgres:15 para tener pg_dump compatible
docker run --rm \
  -e PGPASSWORD \
  -v /tmp:/tmp \
  postgres:15 \
  pg_dump "$SUPABASE_DB_URL" \
    --format=custom \
    --no-owner \
    --no-acl \
    --exclude-schema=supabase_migrations \
    --exclude-schema=auth \
    --exclude-schema=storage \
    --exclude-schema=realtime \
    --exclude-schema=extensions \
    --exclude-schema=graphql \
    --exclude-schema=graphql_public \
    --exclude-schema=pgsodium \
    --exclude-schema=vault \
    --exclude-schema=supabase_functions \
    -f "$DUMP_FILE"

# Si el dump vacío falló por schemas, reintentar solo public
if [[ ! -s "$DUMP_FILE" ]]; then
  echo "⚠️  Dump vacío/fallido; reintento solo schema public..."
  docker run --rm -v /tmp:/tmp postgres:15 \
    pg_dump "$SUPABASE_DB_URL" \
      --format=custom --no-owner --no-acl --schema=public \
      -f "$DUMP_FILE"
fi

ls -lh "$DUMP_FILE"

echo "=== 3) Crear BD destino $LOCAL_DB_NAME (si no existe) ==="
docker exec -e PGPASSWORD="$LOCAL_DB_PASSWORD" "$LOCAL_PG_CONTAINER" \
  psql -U "$LOCAL_DB_USER" -d postgres -tc \
  "SELECT 1 FROM pg_database WHERE datname='${LOCAL_DB_NAME}'" | grep -q 1 \
  || docker exec -e PGPASSWORD="$LOCAL_DB_PASSWORD" "$LOCAL_PG_CONTAINER" \
       psql -U "$LOCAL_DB_USER" -d postgres -c "CREATE DATABASE ${LOCAL_DB_NAME} OWNER ${LOCAL_DB_USER};"

echo "=== 4) Restore en local ==="
# Copiar dump al contenedor y restaurar
docker cp "$DUMP_FILE" "$LOCAL_PG_CONTAINER:/tmp/arunachala.dump"
docker exec -e PGPASSWORD="$LOCAL_DB_PASSWORD" "$LOCAL_PG_CONTAINER" \
  pg_restore -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" \
    --no-owner --no-acl --clean --if-exists \
    /tmp/arunachala.dump || true
# pg_restore devuelve warnings a menudo; comprobamos tablas

echo "=== 5) Verificación ==="
docker exec -e PGPASSWORD="$LOCAL_DB_PASSWORD" "$LOCAL_PG_CONTAINER" \
  psql -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" -c "\dt"
docker exec -e PGPASSWORD="$LOCAL_DB_PASSWORD" "$LOCAL_PG_CONTAINER" \
  psql -U "$LOCAL_DB_USER" -d "$LOCAL_DB_NAME" -c "SELECT COUNT(*) AS contents FROM contents;"

echo ""
echo "✅ Dump/restore listo."
echo ""
echo "Siguiente: en Coolify (API) pon DATABASE_URL apuntando al Postgres local:"
echo "  postgresql://${LOCAL_DB_USER}:${LOCAL_DB_PASSWORD}@${LOCAL_PG_CONTAINER}:5432/${LOCAL_DB_NAME}"
echo ""
echo "Asegura que el contenedor API y ${LOCAL_PG_CONTAINER} están en la misma red Docker (coolify)."
echo "Luego Redeploy del API y prueba /api/content."
