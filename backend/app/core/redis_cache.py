"""
Redis Cache Module — Arunachala Backend
=======================================
Provides an async Redis cache layer with graceful fallback.
"""

import json
import os
import logging
from typing import Any, Optional

# Re-export key helpers and TTLs for backward compatibility
from app.core.cache_keys import (
    TTL_INVENTORY, TTL_CONFIG, TTL_CONTENT, TTL_SCHEDULES, TTL_SITE_CONFIG,
    key_inventory, key_agent_config, key_site_config, key_content_list, key_schedules
)

logger = logging.getLogger(__name__)

# --- Import redis (optional dependency) ---
try:
    import redis.asyncio as aioredis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("redis package not installed — caching disabled")


class RedisCache:
    """
    Async Redis cache with graceful degradation.
    The client is lazy-initialized on first use.
    """

    def __init__(self):
        self._client: Optional[Any] = None
        self._healthy = False

    async def connect(self) -> None:
        """Connect to Redis. Called from FastAPI startup event."""
        if not REDIS_AVAILABLE:
            logger.info("Redis library not installed — cache disabled")
            return

        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        try:
            self._client = aioredis.from_url(
                redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=2,
                socket_timeout=2,
                retry_on_timeout=False,
            )
            # Ping to validate connection
            await self._client.ping()
            self._healthy = True
            logger.info(f"✅ Redis connected: {redis_url}")
        except Exception as exc:
            self._client = None
            self._healthy = False
            logger.warning(f"⚠️  Redis not available ({exc}) — running without cache")

    async def disconnect(self) -> None:
        """Close Redis connection. Called from FastAPI shutdown event."""
        if self._client:
            try:
                await self._client.aclose()
            except Exception:
                pass
            self._client = None
            self._healthy = False
            logger.info("Redis connection closed")

    async def get(self, key: str) -> Optional[Any]:
        """Retrieve a cached value (deserialized from JSON)."""
        if not self._healthy or not self._client:
            return None
        try:
            raw = await self._client.get(key)
            if raw is None:
                return None
            return json.loads(raw)
        except Exception as exc:
            logger.debug(f"Cache GET error for '{key}': {exc}")
            self._healthy = False
            return None

    async def set(self, key: str, value: Any, ttl: int = 300, nx: bool = False) -> bool:
        """
        Store a value in the cache (serialized as JSON).
        If nx=True, only sets the key if it does NOT already exist.
        """
        if not self._healthy or not self._client:
            return False
        try:
            serialized = json.dumps(value, default=str)
            if nx:
                result = await self._client.set(key, serialized, ex=ttl, nx=True)
                return bool(result)
            else:
                await self._client.setex(key, ttl, serialized)
                return True
        except Exception as exc:
            logger.debug(f"Cache SET error for '{key}': {exc}")
            self._healthy = False
            return False

    async def delete(self, key: str) -> bool:
        """Delete a specific cache key."""
        if not self._healthy or not self._client:
            return False
        try:
            await self._client.delete(key)
            return True
        except Exception as exc:
            logger.debug(f"Cache DELETE error for '{key}': {exc}")
            return False

    async def invalidate_pattern(self, pattern: str) -> int:
        """Delete all cache keys matching a glob pattern."""
        if not self._healthy or not self._client:
            return 0
        try:
            keys = await self._client.keys(pattern)
            if not keys:
                return 0
            deleted = await self._client.delete(*keys)
            logger.debug(f"Cache invalidated {deleted} keys matching '{pattern}'")
            return deleted
        except Exception as exc:
            logger.debug(f"Cache INVALIDATE error for pattern '{pattern}': {exc}")
            return 0

    async def exists(self, key: str) -> bool:
        """Check if a key exists in the cache."""
        if not self._healthy or not self._client:
            return False
        try:
            return bool(await self._client.exists(key))
        except Exception:
            return False

    @property
    def is_healthy(self) -> bool:
        return self._healthy


# Singleton instance
cache = RedisCache()
