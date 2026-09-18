#!/usr/bin/env python3
"""
Migra ficheros del bucket Supabase `arunachala-images` al disco local (`/app/static`)
y reescribe las URLs en la base de datos a rutas `/static/...`.

Requisitos:
  - DATABASE_URL
  - SUPABASE_URL + SUPABASE_KEY (service role preferible) para poder descargar
    aunque el CDN público devuelva 402
  - Volumen persistente montado en STATIC_DIR (por defecto backend/static)

Uso (dentro del contenedor backend o en el VPS con el .env cargado):

  cd /app   # o backend/
  python scripts/migrate_supabase_media_to_local.py --dry-run
  python scripts/migrate_supabase_media_to_local.py
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path
from typing import Iterable, Optional, Tuple
from urllib.parse import unquote, urlparse

import httpx
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

load_dotenv()

BUCKET = "arunachala-images"
PUBLIC_MARKERS = (
    f"/storage/v1/object/public/{BUCKET}/",
    f"/{BUCKET}/",
)

# (table, column, is_text_blob_with_embedded_urls)
TARGETS: Tuple[Tuple[str, str, bool], ...] = (
    ("contents", "thumbnail_url", False),
    ("contents", "media_url", False),
    ("contents", "body", True),
    ("gallery", "url", False),
    ("activities", "image_url", False),
    ("massage_types", "image_url", False),
    ("therapy_types", "image_url", False),
    ("promotions", "image_url", False),
    ("site_config", "value", False),
    ("personalization", "value", False),
    ("users", "profile_picture", False),
)

STATIC_DIR = Path(
    os.getenv(
        "STATIC_DIR",
        str(Path(__file__).resolve().parents[1] / "static"),
    )
)


def extract_object_path(url: str) -> Optional[str]:
    if not url or BUCKET not in url:
        return None
    for marker in PUBLIC_MARKERS:
        if marker in url:
            path = url.split(marker, 1)[1]
            return unquote(path.split("?", 1)[0].lstrip("/"))
    return None


def local_static_url(object_path: str) -> str:
    return f"/static/{object_path.lstrip('/')}"


def collect_urls_from_text(value: str) -> Iterable[str]:
    if not value:
        return []
    return re.findall(r"https?://[^\s\"'<>]+arunachala-images/[^\s\"'<>]+", value)


def download_object(
    client: httpx.Client,
    supabase_url: str,
    supabase_key: str,
    object_path: str,
    dest: Path,
) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 0:
        return

    # 1) Authenticated download (works even if public CDN is payment-locked)
    auth_url = f"{supabase_url.rstrip('/')}/storage/v1/object/{BUCKET}/{object_path}"
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
    }
    r = client.get(auth_url, headers=headers)
    if r.status_code == 200 and r.content:
        dest.write_bytes(r.content)
        return

    # 2) Public URL fallback
    public_url = (
        f"{supabase_url.rstrip('/')}/storage/v1/object/public/{BUCKET}/{object_path}"
    )
    r2 = client.get(public_url)
    if r2.status_code == 200 and r2.content:
        dest.write_bytes(r2.content)
        return

    raise RuntimeError(
        f"No se pudo descargar {object_path} "
        f"(auth={r.status_code}, public={r2.status_code})"
    )


def rewrite_value(value: str, mapping: dict[str, str]) -> str:
    if not value:
        return value
    out = value
    # Longest URLs first to avoid partial replacements
    for old in sorted(mapping.keys(), key=len, reverse=True):
        out = out.replace(old, mapping[old])
    return out


def gather_supabase_refs(engine: Engine) -> dict[str, set[str]]:
    """object_path -> set of raw URL strings seen in DB."""
    refs: dict[str, set[str]] = {}
    with engine.connect() as conn:
        for table, column, is_blob in TARGETS:
            try:
                rows = conn.execute(text(f"SELECT id, {column} AS val FROM {table}")).mappings()
            except Exception as e:
                print(f"⚠️  Saltando {table}.{column}: {e}")
                continue
            for row in rows:
                val = row["val"]
                if not val or not isinstance(val, str):
                    continue
                candidates = collect_urls_from_text(val) if is_blob or "http" in val else [val]
                if not is_blob and BUCKET in val and val.startswith("http"):
                    candidates = [val]
                elif not is_blob and val.startswith("/static/"):
                    continue
                for raw in candidates:
                    path = extract_object_path(raw)
                    if path:
                        refs.setdefault(path, set()).add(raw.split("?")[0])
    return refs


def update_database(engine: Engine, mapping: dict[str, str], dry_run: bool) -> int:
    updated = 0
    with engine.begin() as conn:
        for table, column, _is_blob in TARGETS:
            try:
                rows = list(
                    conn.execute(text(f"SELECT id, {column} AS val FROM {table}")).mappings()
                )
            except Exception as e:
                print(f"⚠️  Saltando update {table}.{column}: {e}")
                continue
            for row in rows:
                val = row["val"]
                if not val or not isinstance(val, str) or BUCKET not in val:
                    continue
                new_val = rewrite_value(val, mapping)
                if new_val == val:
                    # Also map bare public URLs we might have shortened
                    path = extract_object_path(val)
                    if path:
                        new_val = local_static_url(path) if not _is_blob else rewrite_value(
                            val, {u: local_static_url(path) for u in [val]}
                        )
                if new_val == val:
                    continue
                updated += 1
                print(f"  DB {table}.id={row['id']}.{column}")
                if not dry_run:
                    conn.execute(
                        text(f"UPDATE {table} SET {column} = :v WHERE id = :id"),
                        {"v": new_val, "id": row["id"]},
                    )
    return updated


def main() -> int:
    parser = argparse.ArgumentParser(description="Migrar media Supabase → local")
    parser.add_argument("--dry-run", action="store_true", help="No escribe disco ni DB")
    parser.add_argument(
        "--skip-download",
        action="store_true",
        help="Solo reescribe URLs (asume ficheros ya en STATIC_DIR)",
    )
    args = parser.parse_args()

    database_url = os.getenv("DATABASE_URL")
    supabase_url = os.getenv("SUPABASE_URL", "").rstrip("/")
    supabase_key = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not database_url:
        print("❌ Falta DATABASE_URL")
        return 1
    if not args.skip_download and (not supabase_url or not supabase_key):
        print("❌ Faltan SUPABASE_URL / SUPABASE_KEY (necesarios para descargar)")
        return 1

    print(f"📁 STATIC_DIR = {STATIC_DIR}")
    STATIC_DIR.mkdir(parents=True, exist_ok=True)

    engine = create_engine(database_url)
    refs = gather_supabase_refs(engine)
    print(f"🔎 Objetos Supabase referenciados: {len(refs)}")

    url_mapping: dict[str, str] = {}
    failed = 0

    with httpx.Client(timeout=60.0, follow_redirects=True) as client:
        for object_path, raw_urls in sorted(refs.items()):
            dest = STATIC_DIR / object_path
            local_url = local_static_url(object_path)
            for raw in raw_urls:
                url_mapping[raw] = local_url
                # Variantes con/sin query trailing
                if raw.endswith("?"):
                    url_mapping[raw[:-1]] = local_url

            if args.skip_download:
                if not dest.exists():
                    print(f"⚠️  Falta en disco: {object_path}")
                    failed += 1
                continue

            try:
                if args.dry_run:
                    print(f"  [dry-run] download {object_path} -> {dest}")
                else:
                    download_object(client, supabase_url, supabase_key, object_path, dest)
                    size = dest.stat().st_size
                    print(f"  ✅ {object_path} ({size} bytes)")
            except Exception as e:
                failed += 1
                print(f"  ❌ {object_path}: {e}")

    print(f"\nResumen: refs={len(refs)} fallos_download={failed}")

    if failed and not args.dry_run and not args.skip_download:
        print(
            f"\n🛑 Abortando update de BD: {failed} descargas fallidas. "
            "Las URLs en Postgres NO se modifican.\n"
            "Si ya corriste una migración que sí reescribió la BD, usa:\n"
            "  python3 scripts/rollback_static_urls_to_supabase.py"
        )
        return 2

    print(f"\n📝 Actualizando base de datos ({'dry-run' if args.dry_run else 'apply'})...")
    updated = update_database(engine, url_mapping, dry_run=args.dry_run)
    print(f"Resumen final: refs={len(refs)} db_updates={updated} fallos_download={failed}")

    if failed:
        print(
            "\n⚠️  Hubo descargas fallidas. Si Supabase sigue en 402, reactiva el plan "
            "temporalmente o usa --skip-download tras restaurar un backup en STATIC_DIR."
        )
        return 2

    print("\n✅ Migración completada.")
    print("Siguiente paso: STORAGE_TYPE=local en Coolify y redeploy del backend.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
