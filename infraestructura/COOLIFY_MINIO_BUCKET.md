# Bucket de media (MinIO)

Las subidas (imágenes/audio) van a MinIO con `STORAGE_TYPE=s3`.

## Variables del backend (Coolify → Environment → Production)

```
STORAGE_TYPE=s3
S3_ENDPOINT_URL=http://arunachala-minio:9000
S3_ACCESS_KEY=arunachala
S3_SECRET_KEY=********
S3_BUCKET=arunachala-media
S3_PUBLIC_URL=https://media.yogayterapiasarunachala.es
S3_REGION=us-east-1
```

El bucket se crea en la primera subida (lectura pública).

## Contenedor (si no existe)

```bash
docker run -d \
  --name arunachala-minio \
  --restart unless-stopped \
  --network coolify \
  -e MINIO_ROOT_USER=arunachala \
  -e MINIO_ROOT_PASSWORD='CLAVE' \
  -v arunachala_minio_data:/data \
  quay.io/minio/minio:RELEASE.2025-09-07T16-13-09Z \
  server /data --console-address ":9001"
```

## DNS

`media.yogayterapiasarunachala.es` → A → IP del VPS

## Comprobar

1. Redeploy API con las env de arriba
2. Sube una imagen desde el dashboard
3. URL tipo: `https://media.yogayterapiasarunachala.es/arunachala-media/gallery/...`
4. Debe abrir en el navegador (200)

## Alternativa

Sin MinIO: `STORAGE_TYPE=local` + volumen persistente en `/app/static`.
