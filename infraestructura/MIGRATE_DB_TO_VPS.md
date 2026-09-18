# Migrar base de datos: Supabase → Postgres del VPS

Supabase usa **Postgres 17**. En el VPS, `infraestructura-postgres-1` es
**Postgres 15** (n8n) — no sirve para el dump ni para restaurar.

El script crea **`arunachala-postgres`** (Postgres 17) en la red `coolify`,
con la BD `arunachala_web`, sin tocar n8n.

## Resumen

| Antes | Después |
|--------|---------|
| `DATABASE_URL` → pooler Supabase | `DATABASE_URL` → `arunachala-postgres:5432` |
| Storage sigue en Supabase (roto) | Media: MinIO / local (otro tema) |

## 0. Preparación

1. Mantenimiento corto (cutover 1–5 min).
2. **Direct connection** de Supabase (`db.xxxxx.supabase.co:5432`).
   Codifica `!` en la password como `%21`.
3. No uses el pooler (`:6543` / `pooler.supabase.com`).

## 1. Dump + restore

```bash
cd /ruta/al/repo/infraestructura
chmod +x migrate_db_supabase_to_local.sh

export SUPABASE_DB_URL='postgresql://postgres:PASS%21@db.REF.supabase.co:5432/postgres?sslmode=require'

./migrate_db_supabase_to_local.sh
```

El script:

1. Crea/arranca `arunachala-postgres` (imagen `postgres:17`) si no existe.
2. Hace `pg_dump` con cliente 17 (evita el error de version mismatch).
3. Restaura en `arunachala_web`.

Deberías ver tablas (`contents`, `gallery`, …) y `COUNT(*)` de contents > 0.

## 2. Cutover en Coolify

API → Environment → **Production**:

```
DATABASE_URL=postgresql://arunachala:arunachala1234@arunachala-postgres:5432/arunachala_web
```

(ajusta password si la cambiaste)

→ **Save + Redeploy**

## 3. Comprobar

```bash
curl -sS 'https://api.yogayterapiasarunachala.es/api/content?type=article&status=published&limit=1' | head -c 400
```

Login al dashboard, listar contenidos.

## 4. Rollback

Vuelve el `DATABASE_URL` de Supabase (pooler) en Coolify y Redeploy.

## Notas

- **n8n** sigue en `infraestructura-postgres-1` (PG15); no lo toques.
- Solo se migra el schema `public` (sin `auth`/`storage` de Supabase).
- Cambia `arunachala1234` en producción cuando puedas.
- Media (MinIO) es un paso aparte.
