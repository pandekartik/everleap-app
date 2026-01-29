"""
Celery background tasks.
"""
import asyncio
import logging
from datetime import datetime, timedelta, timezone

from workers.celery_app import celery_app
from services.email import email_service

logger = logging.getLogger(__name__)


@celery_app.task(name="send_email_task")
def send_email_task(to_email: str, subject: str, body_html: str, body_text: str = None):
    """Send email asynchronously."""
    asyncio.run(email_service.send_email(to_email, subject, body_html, body_text))
    return {"sent": True, "to": to_email}


@celery_app.task(name="check_linkedin_token_expiry")
def check_linkedin_token_expiry():
    """
    Check for LinkedIn tokens expiring within 7 days and notify admins.
    Should be scheduled to run daily via Celery Beat.
    """
    from sqlalchemy import select
    from db.session import get_db_context
    from models import OAuthToken, User, UserRoleAssignment, UserRole, Company
    
    async def check_expiring_tokens():
        async with get_db_context() as db:
            warning_date = datetime.now(timezone.utc) + timedelta(days=7)
            
            # Find LinkedIn tokens expiring within 7 days
            result = await db.execute(
                select(OAuthToken, Company).join(
                    Company, OAuthToken.company_id == Company.id
                ).where(
                    OAuthToken.provider == "linkedin",
                    OAuthToken.expires_at <= warning_date,
                    OAuthToken.expires_at > datetime.now(timezone.utc)
                )
            )
            expiring_tokens = result.all()
            
            for token, company in expiring_tokens:
                # Get admin users for this company
                admin_result = await db.execute(
                    select(User).join(
                        UserRoleAssignment, User.id == UserRoleAssignment.user_id
                    ).where(
                        User.company_id == token.company_id,
                        UserRoleAssignment.role == UserRole.ADMIN,
                        User.is_active == True
                    )
                )
                admins = admin_result.scalars().all()
                
                days_until_expiry = (token.expires_at - datetime.now(timezone.utc)).days
                
                for admin in admins:
                    # Send notification email
                    await email_service.send_email(
                        to_email=admin.email,
                        subject=f"LinkedIn Connection Expiring - {company.name}",
                        body_html=f"""
                        <p>Hi {admin.full_name},</p>
                        <p>Your LinkedIn connection for <strong>{company.name}</strong> 
                        will expire in <strong>{days_until_expiry} days</strong>.</p>
                        <p>Please reconnect your LinkedIn account to continue posting jobs.</p>
                        <p>Go to Settings > Integrations to reconnect.</p>
                        """
                    )
                    logger.info(f"Sent LinkedIn expiry warning to {admin.email} for company {company.name}")
            
            return {"checked": len(expiring_tokens), "notifications_sent": len(expiring_tokens) > 0}
    
    return asyncio.run(check_expiring_tokens())


@celery_app.task(name="verify_linkedin_accounts")
def verify_linkedin_accounts():
    """
    Verify all LinkedIn accounts are still connected and valid.
    Should be scheduled to run every 6 hours via Celery Beat.
    """
    from sqlalchemy import select, update
    from db.session import get_db_context
    from models import OAuthToken
    from services.unipile import unipile_service
    
    async def verify_accounts():
        async with get_db_context() as db:
            # Get all LinkedIn tokens
            result = await db.execute(
                select(OAuthToken).where(
                    OAuthToken.provider == "linkedin"
                )
            )
            tokens = result.scalars().all()
            
            verified = 0
            invalid = 0
            
            for token in tokens:
                account_id = token.access_token
                account_result = await unipile_service.get_account(account_id)
                
                if account_result.get("success"):
                    verified += 1
                else:
                    invalid += 1
                    logger.warning(
                        f"LinkedIn account {account_id} for company {token.company_id} "
                        f"appears invalid: {account_result.get('error')}"
                    )
            
            return {"verified": verified, "invalid": invalid, "total": len(tokens)}
    
    return asyncio.run(verify_accounts())

