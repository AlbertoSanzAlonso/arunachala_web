# Postgres en el VPS (estado actual)

La app usa **`arunachala-postgres`** (Postgres 17) en la red `coolify`.

```
DATABASE_URL=postgresql://arunachala:PASSWORD@arunachala-postgres:5432/arunachala_web
```

No uses el Postgres 15 de n8n (`infraestructura-postgres-1`).

## Re-dump desde un remoto (opcional)

```bash
export REMOTE_DB_URL='postgresql://user:PASS%21@host:5432/postgres?sslmode=require'
./migrate_db_to_local.sh
```

O con dump ya hecho:

```bash
export DUMP_FILE=/tmp/archivo.dump
export SKIP_DUMP=1
./migrate_db_to_local.sh
```

## Rollback

Restaura un dump anterior en `arunachala-postgres` o cambia `DATABASE_URL` a un backup conocido.
