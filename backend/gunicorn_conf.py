"""
Gunicorn configuration for production.

With multiple workers, each process runs FastAPI startup hooks independently.
Background jobs (APScheduler) must run in exactly one worker to avoid duplicate
n8n webhook triggers (e.g. SEO blog automation firing 4 times with -w 4).
"""
import os


def post_fork(server, worker):
    """Assign the automation scheduler to a single worker process."""
    if not getattr(server, "_scheduler_worker_assigned", False):
        server._scheduler_worker_assigned = True
        os.environ["ENABLE_SCHEDULER"] = "1"
        print(f"📅 Scheduler enabled on worker pid={worker.pid}")
    else:
        os.environ["ENABLE_SCHEDULER"] = "0"
