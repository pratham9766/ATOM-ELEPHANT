from celery import Celery

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "elephant",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=["app.tasks.escalations", "app.tasks.reports"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="Asia/Kolkata",
    enable_utc=True,
)
