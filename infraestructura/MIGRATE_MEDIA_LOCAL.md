# Migrar media de Supabase → disco del VPS

Los ficheros (imágenes/audio) están en Supabase Storage. Este proceso los baja al
volumen local del backend (`/app/static`) y reescribe las URLs en Postgres a
`/static/...`. Nuevas subidas usarán `STORAGE_TYPE=local`.

## Bloqueo actual

Si Supabase responde `402 Payment Required`, **hay que reactivar el plan unos
minutos** (o restaurar un backup de los ficheros) para poder descargarlos.
La service role key suele seguir funcionando aunque el CDN público falle; el
script prueba ambas vías.

## Pasos en el servidor correcto (`204.168.140.253`)

1. En Coolify (http://204.168.140.253:8000):
   - Variable de entorno del backend: `STORAGE_TYPE=local`
   - Añade volumen persistente: host o named volume → `/app/static`
   - Despliega el backend con el código nuevo (script + compose)

2. Dentro del contenedor del API:

```bash
docker exec -it NOMBRE_CONTENEDOR_API bash
cd /app
python scripts/migrate_supabase_media_to_local.py --dry-run
python scripts/migrate_supabase_media_to_local.py
```

3. Comprueba:

```bash
curl -I https://api.yogayterapiasarunachala.es/static/gallery/articles/ALGUN_FICHERO.webp
```

Debe devolver `200`.

4. Redeploy del frontend (Vercel) para que `getImageUrl` apunte a la API y no a Supabase.

## Compose local/prod

`infraestructura/docker-compose.prod.yml` ya monta `backend_static:/app/static`
y fuerza `STORAGE_TYPE=local`.
