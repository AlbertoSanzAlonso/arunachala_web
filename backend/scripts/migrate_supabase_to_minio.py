"""
Copia todo el media legacy (URLs Supabase en la BD) a MinIO y actualiza las filas.

No hace falta API key: los objetos públicos se descargan por URL.
Solo migra lo referenciado en Postgres (~135 URLs hoy). Archivos huérfanos
en el bucket antiguo no aparecen en la BD y no se copian.

Uso en el VPS (contenedor del API, con STORAGE_TYPE=s3):

  docker exec -it <api> python -m scripts.migrate_supabase_to_minio --dry-run
  docker exec -it <api> python -m scripts.migrate_supabase_to_minio

También se dispara solo al arrancar el API (legacy_only), o vía:
  POST /api/dashboard/recompress-media?legacy_only=true
"""
from __future__ import annotations

import argparse
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.core.database import SessionLocal
from app.services.media_recompress import run_recompress


def _log(msg: str) -> None:
    print(msg, flush=True)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Backup/migra media de Supabase (URLs en BD) → MinIO"
    )
    parser.add_argument("--dry-run", action="store_true", help="Solo inspecciona, no escribe")
    parser.add_argument("--limit", type=int, default=None, help="Máximo de filas a procesar")
    args = parser.parse_args(argv)

    _log("Migración Supabase → MinIO (solo URLs legacy en la BD)")
    _log("Conectando a la base de datos...")
    db = SessionLocal()
    try:
        result = run_recompress(
            db,
            dry_run=args.dry_run,
            limit=args.limit,
            progress=_log,
            legacy_only=True,
        )
        for line in result.details:
            _log(line)
        _log(
            f"\nResumen: scanned={result.scanned} updated={result.updated} "
            f"skipped={result.skipped} failed={result.failed} "
            f"saved≈{result.saved_bytes // 1024}KB"
        )
        if result.failed and not result.updated:
            return 1
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
