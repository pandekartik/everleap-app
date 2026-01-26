"""
Email service for sending emails via Gmail SMTP.
Supports templated emails and async sending.
"""
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, List, Optional

from jinja2 import Template

from core.config import settings


class EmailService:
    """Service for sending emails via Gmail SMTP."""
    
    def __init__(self):
        """Initialize email service with SMTP configuration."""
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL
        self.from_name = settings.SMTP_FROM_NAME
    
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
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        body_html: str,
        body_text: Optional[str] = None,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None
    ) -> bool:
        """
        Send email via SMTP.
        
        Args:
            to_email: Recipient email
            subject: Email subject
            body_html: HTML body
            body_text: Plain text body (optional)
            cc: CC recipients (optional)
            bcc: BCC recipients (optional)
            
        Returns:
            True if sent successfully, False otherwise
        """
        try:
            message = self._create_message(
                to_email, subject, body_html, body_text, cc, bcc
            )
            
            # Prepare recipient list
            recipients = [to_email]
            if cc:
                recipients.extend(cc)
            if bcc:
                recipients.extend(bcc)
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(message, to_addrs=recipients)
            
            return True
            
        except Exception as e:
            # Log error (implement proper logging)
            print(f"Email send error: {str(e)}")
            return False
    
    def render_template(self, template_html: str, variables: Dict[str, str]) -> str:
        """
        Render email template with variables.
        
        Args:
            template_html: HTML template string
            variables: Dictionary of template variables
            
        Returns:
            Rendered HTML string
        """
        template = Template(template_html)
        return template.render(**variables)
    
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
