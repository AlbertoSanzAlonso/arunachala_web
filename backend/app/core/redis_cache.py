"""
Redis Cache Module — Arunachala Backend
=======================================
Provides an async Redis cache layer with graceful fallback.
If Redis is unavailable, all operations become no-ops so the
application keeps running without cache (but without errors).

Usage:
    from app.core.redis_cache import cache

    # Store a value (TTL in seconds)
    await cache.set("my_key", {"data": "value"}, ttl=300)

    # Retrieve a value (returns None on miss or Redis down)
    data = await cache.get("my_key")

    # Invalidate a single key
    await cache.delete("my_key")

    # Invalidate all keys matching a pattern
    await cache.invalidate_pattern("inventory:*")
"""

import json
import os
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Import redis — optional dependency
# ---------------------------------------------------------------------------
try:
    import redis.asyncio as aioredis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("redis package not installed — caching disabled")


# ---------------------------------------------------------------------------
# Cache TTL constants (seconds)
# ---------------------------------------------------------------------------
TTL_INVENTORY   = int(os.getenv("CACHE_TTL_INVENTORY", 300))    # 5 min
TTL_CONFIG      = int(os.getenv("CACHE_TTL_CONFIG",    600))    # 10 min
TTL_CONTENT     = int(os.getenv("CACHE_TTL_CONTENT",   120))    # 2 min
TTL_SCHEDULES   = int(os.getenv("CACHE_TTL_SCHEDULES", 300))    # 5 min
TTL_SITE_CONFIG = int(os.getenv("CACHE_TTL_SITE_CONFIG", 300))  # 5 min


# ---------------------------------------------------------------------------
# Cache key helpers
# ---------------------------------------------------------------------------
def key_inventory(lang: str = "es") -> str:
    return f"inventory:{lang}"

def key_agent_config() -> str:
    return "config:agent"

def key_site_config() -> str:
    return "config:site"

def key_content_list(content_type: str, category: str = "", status: str = "") -> str:
    return f"content:list:{content_type}:{category}:{status}"

def key_schedules(week_offset: int = 0) -> str:
    return f"schedules:{week_offset}"


# ---------------------------------------------------------------------------
# RedisCache class
# ---------------------------------------------------------------------------
class RedisCache:
    """
    Async Redis cache with graceful degradation.

    The client is lazy-initialized on first use, so startup is never
    blocked even when Redis is not yet ready.
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

    # ------------------------------------------------------------------
    # Read / Write / Delete
    # ------------------------------------------------------------------

    async def get(self, key: str) -> Optional[Any]:
        """
        Retrieve a cached value (deserialized from JSON).
        Returns None on cache miss or when Redis is unavailable.
        """
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

    async def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        """
        Store a value in the cache (serialized as JSON).
        Returns True on success, False otherwise.
        """
        if not self._healthy or not self._client:
            return False
        try:
            serialized = json.dumps(value, default=str)  # default=str handles datetime
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
        """
        Delete all cache keys matching a glob pattern (e.g. 'content:*').
        Returns the number of keys deleted.
        """
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


# ---------------------------------------------------------------------------
# Singleton instance — import this everywhere
# ---------------------------------------------------------------------------
cache = RedisCache()
