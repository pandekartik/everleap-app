"""
Email service with template support and SMTP sending.
Loads email templates from database and sends branded emails via Gmail SMTP.
"""
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any, Dict, List, Optional
from uuid import UUID

from jinja2 import Template
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from models import Company, EmailQueue, EmailTemplate


class EmailService:
    """Service for sending emails using database templates and Gmail SMTP."""
    
    def __init__(self):
        """Initialize email service with SMTP configuration."""
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL
        self.from_name = settings.SMTP_FROM_NAME
    
    def get_logo_url(self) -> str:
        """
        Get the logo URL from local backend.
        Logo is served from /static/Logo.svg endpoint.
        """
        return f"{settings.BACKEND_URL}/static/Logo.png"
    
    async def get_template(
        self, 
        db: AsyncSession, 
        template_name: str,
        company_id: Optional[UUID] = None
    ) -> Optional[EmailTemplate]:
        """
        Get email template from database.
        First tries company-specific template, then falls back to system template.
        """
        if company_id:
            # Try company-specific template first
            result = await db.execute(
                select(EmailTemplate).where(
                    EmailTemplate.company_id == company_id,
                    EmailTemplate.template_name == template_name
                )
            )
            template = result.scalar_one_or_none()
            if template:
                return template
        
        # Fall back to system template
        result = await db.execute(
            select(EmailTemplate).where(
                EmailTemplate.template_name == template_name,
                EmailTemplate.is_system == True
            )
        )
        return result.scalar_one_or_none()
    
    def _create_message(
        self,
        to_email: str,
        subject: str,
        body_html: str,
        body_text: Optional[str] = None,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None
    ) -> MIMEMultipart:
        """
        Create email message.
        
        Args:
            to_email: Recipient email
            subject: Email subject
            body_html: HTML body
            body_text: Plain text body (optional)
            cc: CC recipients (optional)
            bcc: BCC recipients (optional)
            
        Returns:
            MIMEMultipart message
        """
        message = MIMEMultipart("alternative")
        message["From"] = f"{self.from_name} <{self.from_email}>"
        message["To"] = to_email
        message["Subject"] = subject
        
        if cc:
            message["Cc"] = ", ".join(cc)
        
        # Add plain text part if provided
        if body_text:
            part1 = MIMEText(body_text, "plain")
            message.attach(part1)
        
        # Add HTML part
        part2 = MIMEText(body_html, "html")
        message.attach(part2)
        
        return message
    
    def render_template(self, template_html: str, variables: Dict[str, str]) -> str:
        """
        Render email template with variables.
        Supports both Jinja2 syntax and simple {{variable}} replacement.
        
        Args:
            template_html: HTML template string
            variables: Dictionary of template variables
            
        Returns:
            Rendered HTML string
        """
        # First try Jinja2 rendering
        try:
            template = Template(template_html)
            return template.render(**variables)
        except:
            # Fall back to simple replacement
            rendered = template_html
            for key, value in variables.items():
                # Replace {{key}} with value
                rendered = rendered.replace(f"{{{{{key}}}}}", str(value))
            return rendered
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        body_html: str,
        body_text: Optional[str] = None,
        cc_emails: Optional[List[str]] = None,
        bcc_emails: Optional[List[str]] = None,
        attachments: Optional[Dict] = None,
        priority: int = 5
    ) -> bool:
        """
        Send email via SMTP.
        
        Args:
            to_email: Recipient email
            subject: Email subject
            body_html: HTML body
            body_text: Plain text body (optional)
            cc_emails: CC recipients (optional)
            bcc_emails: BCC recipients (optional)
            attachments: Email attachments (optional)
            priority: Email priority (1-10, 10 is highest)
            
        Returns:
            True if sent successfully, False otherwise
        """
        try:
            message = self._create_message(
                to_email, subject, body_html, body_text, cc_emails, bcc_emails
            )
            
            # Prepare recipient list
            recipients = [to_email]
            if cc_emails:
                recipients.extend(cc_emails)
            if bcc_emails:
                recipients.extend(bcc_emails)
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(message, to_addrs=recipients)
            
            print(f"\n{'='*80}")
            print(f"[EMAIL] Successfully sent email to: {to_email}")
            print(f"[EMAIL] Subject: {subject}")
            print(f"[EMAIL] Priority: {priority}")
            print(f"{'='*80}\n")
            
            return True
            
        except Exception as e:
            # Log error (implement proper logging)
            print(f"\n{'='*80}")
            print(f"[EMAIL ERROR] Failed to send email to: {to_email}")
            print(f"[EMAIL ERROR] Subject: {subject}")
            print(f"[EMAIL ERROR] Error: {str(e)}")
            print(f"{'='*80}\n")
            return False
    
    async def send_templated_email(
        self,
        db: AsyncSession,
        to_email: str,
        template_name: str,
        context: Dict[str, Any],
        company_id: Optional[UUID] = None,
        cc_emails: Optional[List[str]] = None,
        bcc_emails: Optional[List[str]] = None,
        priority: int = 5
    ) -> bool:
        """
        Send email using database template.
        
        Args:
            db: Database session
            to_email: Recipient email
            template_name: Name of template to use
            context: Variables to replace in template (e.g., {"user_name": "John"})
            company_id: Company ID for company-specific templates
            cc_emails: CC recipients
            bcc_emails: BCC recipients
            priority: Email priority (1-10, 10 is highest)
            
        Returns:
            True if sent successfully, False otherwise
        """
        # Get company info if company_id provided
        company_name = "Everleap"
        if company_id:
            company_result = await db.execute(
                select(Company).where(Company.id == company_id)
            )
            company = company_result.scalar_one_or_none()
            if company:
                company_name = company.name
        
        # Add default context variables
        context.setdefault("company_name", company_name)
        context.setdefault("logo_url", self.get_logo_url())
        
        # Get template
        template = await self.get_template(db, template_name, company_id)
        if not template:
            raise ValueError(f"Email template '{template_name}' not found")
        
        # Render template
        subject = self.render_template(template.subject, context)
        body_html = self.render_template(template.body_html, context)
        body_text = self.render_template(template.body_text or "", context)
        
        # Send email via SMTP
        return await self.send_email(
            to_email=to_email,
            subject=subject,
            body_html=body_html,
            body_text=body_text,
            cc_emails=cc_emails,
            bcc_emails=bcc_emails,
            priority=priority
        )
    
    async def send_welcome_email(
        self,
        to_email: str,
        user_name: str,
        company_name: str,
        activation_link: str
    ) -> bool:
        """
        Send welcome email to new user.
        
        Args:
            to_email: User email
            user_name: User full name
            company_name: Company name
            activation_link: Link to activate account
            
        Returns:
            True if sent successfully
        """
        subject = f"Welcome to {company_name}!"
        
        body_html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333;">Welcome {user_name}!</h1>
                <p>You have been invited to join {company_name} on Everleap.</p>
                <p>Please click the button below to set your password and get started:</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="{activation_link}" 
                       style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 4px; display: inline-block;">
                        Activate Account
                    </a>
                </p>
                <p style="color: #666; font-size: 14px;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    {activation_link}
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #999; font-size: 12px;">
                    This is an automated email from Everleap. Please do not reply.
                </p>
            </body>
        </html>
        """
        
        body_text = f"""
        Welcome {user_name}!
        
        You have been invited to join {company_name} on Everleap.
        
        Please visit the following link to set your password and get started:
        {activation_link}
        
        ---
        This is an automated email from Everleap. Please do not reply.
        """
        
        return await self.send_email(to_email, subject, body_html, body_text)
    
    async def send_application_received_email(
        self,
        to_email: str,
        candidate_name: str,
        job_title: str,
        company_name: str
    ) -> bool:
        """
        Send confirmation email when application is received.
        
        Args:
            to_email: Candidate email
            candidate_name: Candidate name
            job_title: Job title applied for
            company_name: Company name
            
        Returns:
            True if sent successfully
        """
        subject = f"Application Received - {job_title}"
        
        body_html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Thank you for your application!</h2>
                <p>Hi {candidate_name},</p>
                <p>We have received your application for the position of <strong>{job_title}</strong> 
                   at {company_name}.</p>
                <p>Our team will review your application and get back to you soon.</p>
                <p>Best regards,<br>{company_name} Team</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #999; font-size: 12px;">
                    This is an automated email from Everleap. Please do not reply.
                </p>
            </body>
        </html>
        """
        
        body_text = f"""
        Thank you for your application!
        
        Hi {candidate_name},
        
        We have received your application for the position of {job_title} at {company_name}.
        
        Our team will review your application and get back to you soon.
        
        Best regards,
        {company_name} Team
        """
        
        return await self.send_email(to_email, subject, body_html, body_text)
    
    async def send_interview_scheduled_email(
        self,
        to_email: str,
        candidate_name: str,
        job_title: str,
        interview_datetime: str,
        duration: int,
        meeting_link: Optional[str] = None,
        location: Optional[str] = None
    ) -> bool:
        """
        Send email when interview is scheduled.
        
        Args:
            to_email: Candidate email
            candidate_name: Candidate name
            job_title: Job title
            interview_datetime: Interview date/time formatted string
            duration: Duration in minutes
            meeting_link: Virtual meeting link (optional)
            location: Physical location (optional)
            
        Returns:
            True if sent successfully
        """
        subject = f"Interview Scheduled - {job_title}"
        
        meeting_info = ""
        if meeting_link:
            meeting_info = f'<p><strong>Meeting Link:</strong> <a href="{meeting_link}">{meeting_link}</a></p>'
        elif location:
            meeting_info = f'<p><strong>Location:</strong> {location}</p>'
        
        body_html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Interview Scheduled</h2>
                <p>Hi {candidate_name},</p>
                <p>Great news! We would like to invite you for an interview for the <strong>{job_title}</strong> position.</p>
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
                    <p style="margin: 10px 0;"><strong>Date & Time:</strong> {interview_datetime}</p>
                    <p style="margin: 10px 0;"><strong>Duration:</strong> {duration} minutes</p>
                    {meeting_info}
                </div>
                <p>We look forward to speaking with you!</p>
                <p>Best regards,<br>Hiring Team</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #999; font-size: 12px;">
                    This is an automated email from Everleap. Please do not reply.
                </p>
            </body>
        </html>
        """
        
        meeting_text = ""
        if meeting_link:
            meeting_text = f"Meeting Link: {meeting_link}"
        elif location:
            meeting_text = f"Location: {location}"
        
        body_text = f"""
        Interview Scheduled
        
        Hi {candidate_name},
        
        Great news! We would like to invite you for an interview for the {job_title} position.
        
        Date & Time: {interview_datetime}
        Duration: {duration} minutes
        {meeting_text}
        
        We look forward to speaking with you!
        
        Best regards,
        Hiring Team
        """
        
        return await self.send_email(to_email, subject, body_html, body_text)


# Global email service instance
email_service = EmailService()