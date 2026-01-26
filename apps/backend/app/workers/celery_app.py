"""
Celery application configuration.
"""
from celery import Celery

from core.config import settings


celery_app = Celery(
    "everleap_workers",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["workers.tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,
    task_soft_time_limit=240,
)

# RUN celery using this below command
# PYTHONPATH=app celery -A workers.celery_app:celery_app worker --loglevel=info