"""
Recomprime imágenes ya guardadas (MinIO o URLs legacy) a WebP ligero.

Uso típico en el VPS:
  docker exec -it <backend> python -m scripts.recompress_media
  docker exec -it <backend> python -m scripts.recompress_media --dry-run
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from io import BytesIO
from typing import Callable, List, Optional, Tuple
from urllib.parse import unquote, urlparse
from urllib.request import Request, urlopen

from PIL import Image
from sqlalchemy.orm import Session

from app.core.image_utils import MAX_IMAGE_EDGE, encode_lightweight_webp
from app.core.object_storage import (
    S3_BUCKET,
    S3_PUBLIC_URL,
    STORAGE_TYPE,
    key_from_public_url,
    put_bytes,
)
from app.models.models import (
    Activity,
    Content,
    Gallery,
    MassageType,
    Personalization,
    Promotion,
    TherapyType,
    User,
)

logger = logging.getLogger("uvicorn.error")

MIN_BYTES_TO_TOUCH = 200_000
IMAGE_SUFFIXES = (".webp", ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tif", ".tiff")
LEGACY_PUBLIC_MARKER = "/storage/v1/object/public/"
LEGACY_PUBLIC_BASE = (
    "https://vybpihtssncjalbsnbcr.supabase.co/storage/v1/object/public/arunachala-images/"
)


@dataclass
class RecompressResult:
    scanned: int = 0
    updated: int = 0
    skipped: int = 0
    failed: int = 0
    saved_bytes: int = 0
    details: List[str] = field(default_factory=list)


def _looks_like_image_url(url: str) -> bool:
    if not url or not isinstance(url, str):
        return False
    path = urlparse(url).path.lower()
    if path.endswith((".mp3", ".wav", ".ogg", ".m4a", ".mp4", ".webm")):
        return False
    if any(path.endswith(ext) for ext in IMAGE_SUFFIXES):
        return True
    return any(
        segment in path
        for segment in (
            "/gallery/",
            "/treatments/",
            "/site_customization/",
            "/promotions/",
            "/activities/",
            "/meditations/",
            "/profile_pictures/",
        )
    )


def legacy_object_key(url: str) -> Optional[str]:
    idx = url.find(LEGACY_PUBLIC_MARKER)
    if idx == -1:
        return None
    after = url[idx + len(LEGACY_PUBLIC_MARKER) :]
    slash = after.find("/")
    if slash == -1:
        return None
    return unquote(after[slash + 1 :].split("?", 1)[0])


def resolve_storage_key(url: str) -> Optional[str]:
    key = key_from_public_url(url)
    if key:
        return key.lstrip("/")
    legacy = legacy_object_key(url)
    if legacy:
        return legacy.lstrip("/")
    if url.startswith("/static/"):
        return url[len("/static/") :].lstrip("/")
    return None


def download_bytes(url: str, timeout: int = 20) -> bytes:
    req = Request(url, headers={"User-Agent": "ArunachalaMediaRecompress/1.0"})
    with urlopen(req, timeout=timeout) as resp:
        return resp.read()


def candidate_download_urls(url: str) -> List[str]:
    urls = [url]
    key = resolve_storage_key(url)
    if key and LEGACY_PUBLIC_MARKER not in url:
        legacy = f"{LEGACY_PUBLIC_BASE}{key}"
        if legacy not in urls:
            urls.append(legacy)
    return urls


def needs_work(raw: bytes, source_url: str) -> Tuple[bool, str]:
    """Decide si hay que reencodear o migrar a MinIO."""
    on_legacy = LEGACY_PUBLIC_MARKER in source_url or "supabase.co" in source_url
    on_minio = bool(S3_PUBLIC_URL) and S3_PUBLIC_URL in source_url
    try:
        with Image.open(BytesIO(raw)) as img:
            img.load()
            too_big = max(img.size) > MAX_IMAGE_EDGE or len(raw) >= MIN_BYTES_TO_TOUCH
            not_webp = img.format != "WEBP"
    except Exception as e:
        return False, f"unreadable:{e}"

    if on_legacy:
        return True, "migrate_legacy"
    if not on_minio and source_url.startswith("/static/"):
        return True, "migrate_static"
    if too_big or not_webp:
        return True, "recompress"
    return False, "already_ok"


def ensure_webp_key(key: str) -> str:
    if key.lower().endswith(".webp"):
        return key
    if "." in key.rsplit("/", 1)[-1]:
        return f"{key.rsplit('.', 1)[0]}.webp"
    return f"{key}.webp"


def public_url_for(key: str) -> str:
    return f"{S3_PUBLIC_URL.rstrip('/')}/{S3_BUCKET}/{key.lstrip('/')}"


def recompress_one(url: str) -> Tuple[Optional[str], int, str]:
    if STORAGE_TYPE != "s3":
        return None, 0, "storage_not_s3"
    if not _looks_like_image_url(url):
        return None, 0, "not_image"

    key = resolve_storage_key(url)
    if not key:
        return None, 0, "no_key"

    raw = None
    source = url
    errors = []
    for candidate in candidate_download_urls(url):
        try:
            raw = download_bytes(candidate)
            source = candidate
            break
        except Exception as e:
            errors.append(f"{candidate[:60]}→{e}")

    if raw is None:
        return None, 0, f"download_failed:{'; '.join(errors)}"

    work, reason = needs_work(raw, source)
    if not work:
        return None, 0, reason

    new_key = ensure_webp_key(key)
    webp = encode_lightweight_webp(Image.open(BytesIO(raw)))
    put_bytes(new_key, webp, content_type="image/webp")
    return public_url_for(new_key), max(0, len(raw) - len(webp)), reason


def is_legacy_url(url: Optional[str]) -> bool:
    if not url:
        return False
    return LEGACY_PUBLIC_MARKER in url or "supabase.co" in url


def collect_image_targets(
    db: Session,
    legacy_only: bool = False,
) -> List[Tuple[object, str]]:
    targets: List[Tuple[object, str]] = []

    for row in db.query(Gallery).all():
        if row.url:
            targets.append((row, "url"))

    for row in db.query(Content).all():
        if row.thumbnail_url:
            targets.append((row, "thumbnail_url"))
        if row.media_url and _looks_like_image_url(row.media_url):
            targets.append((row, "media_url"))

    for model in (MassageType, TherapyType, Activity, Promotion):
        for row in db.query(model).all():
            if getattr(row, "image_url", None):
                targets.append((row, "image_url"))

    for row in db.query(Personalization).all():
        if row.value and _looks_like_image_url(row.value):
            targets.append((row, "value"))

    for row in db.query(User).all():
        if row.profile_picture and _looks_like_image_url(row.profile_picture):
            targets.append((row, "profile_picture"))

    if legacy_only:
        targets = [
            (obj, attr)
            for obj, attr in targets
            if is_legacy_url(getattr(obj, attr, None))
        ]

    return targets


def recompress_all(
    db: Session,
    dry_run: bool = False,
    limit: Optional[int] = None,
    progress: Optional[Callable[[str], None]] = None,
    legacy_only: bool = False,
) -> RecompressResult:
    result = RecompressResult()
    if progress:
        progress("Cargando URLs de imagen desde la base de datos...")
    targets = collect_image_targets(db, legacy_only=legacy_only)
    if limit is not None:
        targets = targets[:limit]
    if progress:
        scope = "legacy (Supabase)" if legacy_only else "todas"
        progress(f"Procesando {len(targets)} imágenes ({scope})...")

    for obj, attr in targets:
        result.scanned += 1
        old_url = getattr(obj, attr)
        table = getattr(obj, "__tablename__", type(obj).__name__)
        label = f"{table}#{getattr(obj, 'id', '?')}.{attr}"
        if progress and result.scanned % 5 == 1:
            progress(f"[{result.scanned}/{len(targets)}] {label}")

        if dry_run:
            try:
                raw = None
                source = old_url
                for candidate in candidate_download_urls(old_url):
                    try:
                        raw = download_bytes(candidate)
                        source = candidate
                        break
                    except Exception:
                        continue
                if raw is None:
                    result.failed += 1
                    result.details.append(f"FAIL {label}: download_failed | {old_url[:100]}")
                    continue
                work, reason = needs_work(raw, source)
                if work:
                    result.updated += 1
                    result.details.append(f"DRY {label}: {reason} ({len(raw)}B)")
                else:
                    result.skipped += 1
                    result.details.append(f"SKIP {label}: {reason}")
            except Exception as e:
                result.failed += 1
                result.details.append(f"FAIL {label}: {e}")
            continue

        try:
            new_url, saved, reason = recompress_one(old_url)
        except Exception as e:
            result.failed += 1
            result.details.append(f"FAIL {label}: {e} | {old_url[:100]}")
            continue

        if new_url is None:
            if reason in ("already_ok", "not_image", "storage_not_s3"):
                result.skipped += 1
                result.details.append(f"SKIP {label}: {reason}")
            else:
                result.failed += 1
                result.details.append(f"FAIL {label}: {reason} | {old_url[:100]}")
            continue

        if new_url != old_url:
            setattr(obj, attr, new_url)
        result.updated += 1
        result.saved_bytes += saved
        result.details.append(
            f"OK {label}: -{saved // 1024}KB ({reason}) → {new_url.split('/')[-1]}"
        )

    if not dry_run and result.updated:
        db.commit()

    return result


def run_recompress(
    db: Session,
    dry_run: bool = False,
    limit: Optional[int] = None,
    progress: Optional[Callable[[str], None]] = None,
    legacy_only: bool = False,
) -> RecompressResult:
    if progress:
        progress(f"STORAGE_TYPE={STORAGE_TYPE} dry_run={dry_run} legacy_only={legacy_only}")
    result = recompress_all(
        db,
        dry_run=dry_run,
        limit=limit,
        progress=progress,
        legacy_only=legacy_only,
    )
    if progress:
        progress(
            f"scanned={result.scanned} updated={result.updated} "
            f"skipped={result.skipped} failed={result.failed} "
            f"saved≈{result.saved_bytes // 1024}KB"
        )
    return result
