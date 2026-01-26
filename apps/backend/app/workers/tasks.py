"""
Celery background tasks.
"""

from workers.celery_app import celery_app
from services.email import email_service


@celery_app.task(name="send_email_task")
def send_email_task(to_email: str, subject: str, body_html: str, body_text: str = None):
    """Send email asynchronously."""
    import asyncio
    asyncio.run(email_service.send_email(to_email, subject, body_html, body_text))
    return {"sent": True, "to": to_email}
