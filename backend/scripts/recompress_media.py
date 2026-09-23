"""
CLI: recomprime imágenes existentes en MinIO / migra URLs legacy.

  python -m scripts.recompress_media
  python -m scripts.recompress_media --dry-run
  python -m scripts.recompress_media --limit 10
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


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Recomprime media existente a WebP ligero")
    parser.add_argument("--dry-run", action="store_true", help="Solo inspecciona, no escribe")
    parser.add_argument("--limit", type=int, default=None, help="Máximo de filas a procesar")
    args = parser.parse_args(argv)

    db = SessionLocal()
    try:
        result = run_recompress(
            db,
            dry_run=args.dry_run,
            limit=args.limit,
            progress=print,
        )
        for line in result.details:
            print(line)
        print(
            f"\nResumen: scanned={result.scanned} updated={result.updated} "
            f"skipped={result.skipped} failed={result.failed} "
            f"saved≈{result.saved_bytes // 1024}KB"
        )
        return 1 if result.failed and not result.updated else 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
