#!/usr/bin/env python3
"""
Revierte URLs /static/... → URLs públicas de Supabase (bucket arunachala-images).

Útil si se ejecutó migrate_supabase_media_to_local.py con descargas fallidas (402)
pero la BD ya se reescribió.

Uso (en el contenedor API):
  python3 scripts/rollback_static_urls_to_supabase.py --dry-run
  python3 scripts/rollback_static_urls_to_supabase.py
"""

from __future__ import annotations

import argparse
import os
import sys

from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

SUPABASE_PUBLIC = (
    os.getenv("SUPABASE_URL", "https://vybpihtssncjalbsnbcr.supabase.co").rstrip("/")
    + "/storage/v1/object/public/arunachala-images"
)

TARGETS = (
    ("contents", "thumbnail_url"),
    ("contents", "media_url"),
    ("contents", "body"),
    ("gallery", "url"),
    ("activities", "image_url"),
    ("massage_types", "image_url"),
    ("therapy_types", "image_url"),
    ("promotions", "image_url"),
    ("site_config", "value"),
    ("personalization", "value"),
    ("users", "profile_picture"),
)


def to_supabase(val: str) -> str:
    if not val or "/static/" not in val:
        return val
    # Reemplaza rutas /static/X por URL pública
    out = val
    # Variante absoluta por si quedó algo raro
    while "/static/" in out:
        # Sustituye cada ocurrencia /static/path
        idx = out.find("/static/")
        if idx == -1:
            break
        rest = out[idx + len("/static/") :]
        # path hasta espacio, comilla, ) o fin
        end = len(rest)
        for ch in (" ", '"', "'", ")", "<", ">", "\n", "\r", "?"):
            p = rest.find(ch)
            if p != -1:
                end = min(end, p)
        path = rest[:end]
        supabase_url = f"{SUPABASE_PUBLIC}/{path}"
        out = out[:idx] + supabase_url + rest[end:]
    return out


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ Falta DATABASE_URL")
        return 1

    print(f"↩️  Destino: {SUPABASE_PUBLIC}/...")
    engine = create_engine(database_url)
    updated = 0

    with engine.begin() as conn:
        for table, column in TARGETS:
            try:
                rows = list(
                    conn.execute(text(f"SELECT id, {column} AS val FROM {table}")).mappings()
                )
            except Exception as e:
                print(f"⚠️  Saltando {table}.{column}: {e}")
                continue
            for row in rows:
                val = row["val"]
                if not val or not isinstance(val, str) or "/static/" not in val:
                    continue
                new_val = to_supabase(val)
                if new_val == val:
                    continue
                updated += 1
                print(f"  {table}.id={row['id']}.{column}")
                if not args.dry_run:
                    conn.execute(
                        text(f"UPDATE {table} SET {column} = :v WHERE id = :id"),
                        {"v": new_val, "id": row["id"]},
                    )

    print(f"\nResumen: db_updates={updated} ({'dry-run' if args.dry_run else 'apply'})")
    if args.dry_run:
        print("Sin --dry-run se aplican los cambios.")
    else:
        print("✅ Rollback completado. Las URLs vuelven a Supabase (siguen 402 hasta pagar).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
