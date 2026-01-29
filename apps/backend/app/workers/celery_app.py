"""
Celery application configuration.
"""
from celery import Celery
from celery.schedules import crontab

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

# Celery Beat schedule for periodic tasks
celery_app.conf.beat_schedule = {
    # Check for expiring LinkedIn tokens daily at 9 AM UTC
    'check-linkedin-tokens-daily': {
        'task': 'check_linkedin_token_expiry',
        'schedule': crontab(hour=9, minute=0),
    },
    # Verify LinkedIn accounts are still valid every 6 hours
    'verify-linkedin-accounts-periodic': {
        'task': 'verify_linkedin_accounts',
        'schedule': crontab(minute=0, hour='*/6'),
    },
}

# RUN celery using this below command
# PYTHONPATH=app celery -A workers.celery_app:celery_app worker --loglevel=info
# For beat scheduler:
# PYTHONPATH=app celery -A workers.celery_app:celery_app beat --loglevel=info