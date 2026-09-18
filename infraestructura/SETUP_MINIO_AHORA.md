# Crear MinIO (bucket S3) en el VPS de Arunachala

IP del servidor: `204.168.140.253`  
Coolify: http://204.168.140.253:8000

## A) Opción rápida por SSH (recomendada)

En el servidor, como root:

```bash
# Red de Coolify (ajusta si tu red se llama distinto)
docker network ls | grep -i coolify

# Crear volumen + MinIO (imagen en Quay: Docker Hub ya no publica minio/minio)
docker volume create arunachala_minio_data

docker rm -f arunachala-minio 2>/dev/null

docker run -d \
  --name arunachala-minio \
  --restart unless-stopped \
  --network coolify \
  -e MINIO_ROOT_USER=arunachala \
  -e MINIO_ROOT_PASSWORD='CAMBIA_ESTA_CLAVE_LARGA' \
  -v arunachala_minio_data:/data \
  quay.io/minio/minio:RELEASE.2025-09-07T16-13-09Z \
  server /data --console-address ":9001"

# Comprobar
docker ps --filter name=arunachala-minio
docker logs arunachala-minio --tail 20
```

Anota el nombre de red real (`coolify` u otra) y que el contenedor esté en **la misma red** que el API (`qkg88gos...`).

Si el API no ve a MinIO:

```bash
API=$(docker ps --format '{{.Names}}' | grep '^qkg88gos')
docker network connect coolify "$API"   # solo si hace falta
docker exec "$API" getent hosts arunachala-minio
```

## B) Opción Coolify UI

1. http://204.168.140.253:8000 → **+ New** → **Docker Image**
2. Image: `minio/minio:latest`
3. Custom command: `server /data --console-address ":9001"`
4. Env:
   - `MINIO_ROOT_USER=arunachala`
   - `MINIO_ROOT_PASSWORD=...` (mín. 8 caracteres)
5. Persistent storage: mount `/data`
6. Domains:
   - `media.yogayterapiasarunachala.es` → port **9000** (API S3 pública)
7. Deploy

## DNS

En tu DNS (donde gestiones `yogayterapiasarunachala.es`):

```
media.yogayterapiasarunachala.es  →  A  204.168.140.253
```

## Variables del backend (Coolify → app API → Environment)

```
STORAGE_TYPE=s3
S3_ENDPOINT_URL=http://arunachala-minio:9000
S3_ACCESS_KEY=arunachala
S3_SECRET_KEY=CAMBIA_ESTA_CLAVE_LARGA
S3_BUCKET=arunachala-media
S3_PUBLIC_URL=https://media.yogayterapiasarunachala.es
S3_REGION=us-east-1
```

Si Coolify generó otro hostname para MinIO, usa ese en `S3_ENDPOINT_URL` (lo ves en el recurso MinIO).

Luego **Redeploy** del backend.

## Comprobar

```bash
# Desde el host, tras DNS + proxy
curl -I https://media.yogayterapiasarunachala.es/minio/health/live
```

Sube una imagen en el dashboard: la URL debe ser tipo  
`https://media.yogayterapiasarunachala.es/arunachala-media/gallery/...`

## Media antigua

Las URLs antiguas en BD pueden apuntar a storage externo o `/static/` vacío.
Las **nuevas** subidas van a MinIO. Para lo viejo: re-subir o copiar objetos al bucket a mano.
