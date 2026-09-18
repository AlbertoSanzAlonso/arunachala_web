"""
Almacenamiento de objetos unificado.

STORAGE_TYPE:
  - local  → disco /app/static (volumen Coolify)
  - s3     → MinIO / S3 compatible
"""
from __future__ import annotations

import logging
import os
from typing import Optional
from urllib.parse import unquote, urlparse

logger = logging.getLogger("uvicorn.error")

STORAGE_TYPE = (os.getenv("STORAGE_TYPE") or "local").strip().lower()

# S3 / MinIO
S3_ENDPOINT_URL = os.getenv("S3_ENDPOINT_URL", "").rstrip("/")
S3_ACCESS_KEY = os.getenv("S3_ACCESS_KEY") or os.getenv("MINIO_ROOT_USER")
S3_SECRET_KEY = os.getenv("S3_SECRET_KEY") or os.getenv("MINIO_ROOT_PASSWORD")
S3_BUCKET = os.getenv("S3_BUCKET", "arunachala-media")
S3_REGION = os.getenv("S3_REGION", "us-east-1")
# URL pública que usa el navegador (dominio Coolify del MinIO o proxy)
S3_PUBLIC_URL = (os.getenv("S3_PUBLIC_URL") or S3_ENDPOINT_URL).rstrip("/")

_s3_client = None


def _get_s3():
    global _s3_client
    if _s3_client is not None:
        return _s3_client
    if not S3_ENDPOINT_URL or not S3_ACCESS_KEY or not S3_SECRET_KEY:
        raise RuntimeError(
            "STORAGE_TYPE=s3 requiere S3_ENDPOINT_URL, S3_ACCESS_KEY y S3_SECRET_KEY"
        )
    import boto3
    from botocore.client import Config

    _s3_client = boto3.client(
        "s3",
        endpoint_url=S3_ENDPOINT_URL,
        aws_access_key_id=S3_ACCESS_KEY,
        aws_secret_access_key=S3_SECRET_KEY,
        region_name=S3_REGION,
        config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
    )
    return _s3_client


def ensure_bucket() -> None:
    """Crea el bucket si no existe (idempotente). Solo para s3."""
    if STORAGE_TYPE != "s3":
        return
    client = _get_s3()
    try:
        client.head_bucket(Bucket=S3_BUCKET)
    except Exception:
        try:
            client.create_bucket(Bucket=S3_BUCKET)
            logger.info(f"✅ S3 bucket creado: {S3_BUCKET}")
        except Exception as e:
            # Puede existir por race; reintentar head
            try:
                client.head_bucket(Bucket=S3_BUCKET)
            except Exception:
                raise RuntimeError(f"No se pudo crear/usar el bucket {S3_BUCKET}: {e}") from e

    # Política de lectura pública del bucket (objetos accesibles por URL)
    try:
        import json

        policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {"AWS": ["*"]},
                    "Action": ["s3:GetObject"],
                    "Resource": [f"arn:aws:s3:::{S3_BUCKET}/*"],
                }
            ],
        }
        client.put_bucket_policy(Bucket=S3_BUCKET, Policy=json.dumps(policy))
    except Exception as e:
        logger.warning(f"⚠️  No se pudo aplicar política pública al bucket: {e}")


def public_url_for_key(key: str) -> str:
    key = key.lstrip("/")
    return f"{S3_PUBLIC_URL}/{S3_BUCKET}/{key}"


def key_from_public_url(url: str) -> Optional[str]:
    if not url:
        return None
    markers = (
        f"/{S3_BUCKET}/",
        f"{S3_BUCKET}/",
    )
    for marker in markers:
        if marker in url:
            return unquote(url.split(marker, 1)[1].split("?", 1)[0])
    # path-style endpoint/bucket/key
    parsed = urlparse(url)
    parts = parsed.path.lstrip("/").split("/", 1)
    if len(parts) == 2 and parts[0] == S3_BUCKET:
        return unquote(parts[1])
    return None


def put_bytes(key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
    """
    Guarda bytes según STORAGE_TYPE.
    Devuelve URL pública (s3) o ruta /static/... (local).
    """
    key = key.lstrip("/")

    if STORAGE_TYPE == "s3":
        ensure_bucket()
        client = _get_s3()
        client.put_object(
            Bucket=S3_BUCKET,
            Key=key,
            Body=data,
            ContentType=content_type,
        )
        return public_url_for_key(key)

    # local — caller suele escribir a disco; helper por si se usa directo
    from app.core.image_utils import STATIC_DIR

    dest = os.path.join(STATIC_DIR, key)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, "wb") as f:
        f.write(data)
    return f"/static/{key}"


def delete_key_or_url(url_or_key: str) -> bool:
    if STORAGE_TYPE != "s3":
        return False
    key = key_from_public_url(url_or_key) or url_or_key.lstrip("/")
    if not key:
        return False
    try:
        _get_s3().delete_object(Bucket=S3_BUCKET, Key=key)
        logger.info(f"✅ S3 delete: {key}")
        return True
    except Exception as e:
        logger.warning(f"❌ S3 delete failed for {key}: {e}")
        return False
