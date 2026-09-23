# Migrar media de Supabase → MinIO

Las URLs antiguas (`*.supabase.co/storage/v1/object/public/arunachala-images/...`)
siguen en Postgres. El dashboard las muestra porque Supabase aún las sirve; la web
debe usar MinIO (`media.yogayterapiasarunachala.es`).

## Qué se copia

Todo lo **referenciado en la BD** (artículos, galería, masajes, promos, audio de
personalización, etc.): hoy ~135 URLs. Se descarga el objeto público, se sube a
`arunachala-media` y se actualiza la fila a `https://media.../arunachala-media/...`.

No se lista el bucket antiguo completo (hace falta API key). Si hubiera archivos
huérfanos solo en Supabase y no en la BD, no se copian.

## Requisitos

- Contenedor API con `STORAGE_TYPE=s3` y credenciales MinIO
- Redeploy del backend con el código actual (script + migración al arranque)

## Ejecutar en el VPS

```bash
# Nombre del contenedor API (Coolify)
API=$(docker ps --format '{{.Names}}' | grep -E 'api|arunachala' | head -1)
echo "$API"

# Simulación
docker exec -it "$API" python -m scripts.migrate_supabase_to_minio --dry-run

# Copia real + update de BD
docker exec -it "$API" python -m scripts.migrate_supabase_to_minio
```

Alternativa (logueado como admin):

```http
POST /api/dashboard/recompress-media?legacy_only=true&sync=true
Authorization: Bearer <token>
```

Al **arrancar** el API también lanza la migración legacy en segundo plano
(salvo `SKIP_LEGACY_MEDIA_MIGRATE=1`).

## Comprobar

```bash
# Debe ser media.yogayterapiasarunachala.es, no supabase
curl -sS https://api.yogayterapiasarunachala.es/api/treatments/massages \
  | python3 -c "import sys,json; print([m['image_url'][:70] for m in json.load(sys.stdin) if 'Pindas' in m['name']])"

curl -sSI "https://media.yogayterapiasarunachala.es/arunachala-media/gallery/articles/rutinas-de-autocuidado-y-dinacharya-tu-santuario-interior-de-bienestar-integral-con-yoga-en-cornella-20ddfb8e.webp" | head -5
```
