import os

# --- Cache TTL constants (seconds) ---
TTL_INVENTORY   = int(os.getenv("CACHE_TTL_INVENTORY", 300))    # 5 min
TTL_CONFIG      = int(os.getenv("CACHE_TTL_CONFIG",    600))    # 10 min
TTL_CONTENT     = int(os.getenv("CACHE_TTL_CONTENT",   120))    # 2 min
TTL_SCHEDULES   = int(os.getenv("CACHE_TTL_SCHEDULES", 300))    # 5 min
TTL_SITE_CONFIG = int(os.getenv("CACHE_TTL_SITE_CONFIG", 300))  # 5 min

# --- Cache key helpers ---
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
