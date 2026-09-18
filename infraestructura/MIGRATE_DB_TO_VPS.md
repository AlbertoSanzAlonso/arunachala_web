# Migrar base de datos: Supabase → Postgres del VPS

Hoy la API usa Postgres en **Supabase**. En el servidor ya hay
`infraestructura-postgres-1` (también lo usa n8n). Migraremos a una BD
**nueva** `arunachala_web` para no pisar n8n.

## Resumen

| Antes | Después |
|--------|---------|
| `DATABASE_URL` → pooler Supabase | `DATABASE_URL` → Postgres local |
| Storage sigue en Supabase (roto) | Media: MinIO / local (otro tema) |

## 0. Preparación

1. Mantenimiento corto (la web puede fallar 1–5 min en el cutover).
2. Anota la **Direct connection** de Supabase (no el pooler):
   - Dashboard → **Project Settings → Database**
   - Connection string → **URI** → modo **Direct** (`db.xxxxx.supabase.co:5432`)
3. Confirma Postgres local:
   ```bash
   docker ps --format '{{.Names}}' | grep -i postgres
   ```
   Suele ser `infraestructura-postgres-1`.

4. Misma red que el API:
   ```bash
   docker network connect coolify infraestructura-postgres-1 2>/dev/null || true
   API=$(docker ps --format '{{.Names}}' | grep '^qkg88gos' | head -1)
   docker exec "$API" getent hosts infraestructura-postgres-1
   ```

## 1. Dump + restore

Copia el script al servidor (o clona el repo) y:

```bash
cd /ruta/al/repo/infraestructura   # o donde esté el script
chmod +x migrate_db_supabase_to_local.sh

# URL DIRECTA de Supabase (puerto 5432). NO uses :6543 ni *pooler*
export SUPABASE_DB_URL='postgresql://postgres.[REF]:[PASSWORD]@db.[REF].supabase.co:5432/postgres'

# Si el user/pass del postgres local no es arunachala/arunachala1234, ajústalo:
export LOCAL_PG_CONTAINER=infraestructura-postgres-1
export LOCAL_DB_USER=arunachala
export LOCAL_DB_PASSWORD='...'   # la del contenedor local
export LOCAL_DB_NAME=arunachala_web

./migrate_db_supabase_to_local.sh
```

Deberías ver tablas (`contents`, `gallery`, …) y un `COUNT(*)` de contents > 0.

## 2. Cutover en Coolify

API → Environment → **Production** → cambia:

```
DATABASE_URL=postgresql://arunachala:PASSWORD@infraestructura-postgres-1:5432/arunachala_web
```

(usuario/password/host reales de tu Postgres local)

→ **Save + Redeploy**

## 3. Comprobar

```bash
curl -sS 'https://api.yogayterapiasarunachala.es/api/content?type=article&status=published&limit=1' | head -c 400
```

Login al dashboard, listar contenidos.

## 4. Si algo falla (rollback)

Vuelve a poner en Coolify el `DATABASE_URL` de Supabase (pooler) y Redeploy.
El dump local no se borra; puedes reintentar.

## Notas

- **n8n** sigue en `arunachala_db` (u otra BD); no la toques.
- Extensiones de Supabase (`auth`, `storage`, …) se excluyen del dump; solo necesitamos el schema de la app (`public`).
- Cambia la password por defecto `arunachala1234` si aún es esa (seguridad).
- Tras migrar la BD, las URLs de media siguen siendo el problema de Storage/MinIO (migración aparte).
