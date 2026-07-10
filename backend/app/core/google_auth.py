"""Carga credenciales de Google Service Account (Search Console + Indexing API)."""
import json
import os
import binascii
import re
import base64
from typing import Optional

from google.oauth2 import service_account


def _creds_path() -> str:
    return os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "google-credentials.json",
    )


def _parse_google_auth_env(raw: str) -> Optional[dict]:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    clean = raw.strip()
    if re.fullmatch(r"[A-Fa-f0-9]+", clean) and len(clean) % 2 == 0:
        try:
            return json.loads(binascii.unhexlify(clean).decode("utf-8"))
        except Exception:
            pass

    try:
        b64_str = re.sub(r"[^A-Za-z0-9+/=]", "", raw)
        padding = len(b64_str) % 4
        if padding:
            b64_str += "=" * (4 - padding)
        return json.loads(base64.b64decode(b64_str).decode("utf-8"))
    except Exception:
        return None


def get_google_credentials(scopes: list[str]):
    """Devuelve credenciales de service account o None si no están configuradas."""
    google_auth_json = os.getenv("GOOGLE_AUTH_JSON")
    creds_path = _creds_path()

    if google_auth_json:
        creds_data = _parse_google_auth_env(google_auth_json)
        if creds_data:
            return service_account.Credentials.from_service_account_info(
                creds_data, scopes=scopes
            )

    if os.path.exists(creds_path):
        return service_account.Credentials.from_service_account_file(
            creds_path, scopes=scopes
        )

    return None
