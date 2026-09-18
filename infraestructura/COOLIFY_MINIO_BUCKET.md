# Bucket de media en Coolify (MinIO)

A partir de ahora las **nuevas** subidas (imágenes/audio) van a un bucket S3
compatible desplegado en Coolify con **MinIO**, no a Supabase.

`STORAGE_TYPE=s3`

## Variables del backend (Coolify → Environment)

```
STORAGE_TYPE=s3
S3_ENDPOINT_URL=http://NOMBRE_SERVICIO_MINIO:9000
S3_ACCESS_KEY=arunachala          # o el user de MinIO
S3_SECRET_KEY=********            # contraseña fuerte
S3_BUCKET=arunachala-media
S3_PUBLIC_URL=https://media.yogayterapiasarunachala.es
S3_REGION=us-east-1
```

El bucket se crea solo en la primera subida (y se intenta poner lectura pública).

## Desplegar MinIO en Coolify

1. **New Resource → Docker Image**  
   Image: `minio/minio:latest`  
   Command: `server /data --console-address ":9001"`
2. Env:
   - `MINIO_ROOT_USER=...`
   - `MINIO_ROOT_PASSWORD=...` (mín. 8 caracteres)
3. Persistent volume → `/data`
4. Dominio público API S3: `media.yogayterapiasarunachala.es` → puerto **9000**  
   (opcional consola: puerto 9001, no hace falta exponerla)
5. Misma Docker network que el backend (o usa el hostname interno que Coolify asigne en `S3_ENDPOINT_URL`)

## DNS

Crea un registro A/CNAME:

`media.yogayterapiasarunachala.es` → IP del VPS (misma que la API)

## Comprobar

1. Redeploy backend con `STORAGE_TYPE=s3`
2. Sube una imagen desde el dashboard
3. La URL guardada debe ser tipo:  
   `https://media.yogayterapiasarunachala.es/arunachala-media/gallery/articles/....webp`
4. Debe abrir en el navegador (200)

## Notas

- Lo **antiguo** en Supabase sigue roto hasta migrarlo (script
  `migrate_supabase_media_to_local.py` o bajada manual al bucket).
- Si aún no tienes MinIO, puedes usar temporalmente `STORAGE_TYPE=local` +
  volumen `/app/static` (también en el VPS, sin bucket S3).
- En `docker-compose.prod.yml` ya está el servicio `minio` + Caddy para
  `media.yogayterapiasarunachala.es`.
