"""
SQLAlchemy models for Everleap application.
Maps database tables to Python classes.
"""
import enum
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import (
    DECIMAL,
    BigInteger,
    Boolean,
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import INET, JSONB, UUID as PG_UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from db.session import Base


# Enums matching database
class UserRole(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    HR = "HR"
    CANDIDATE = "CANDIDATE"


class EmploymentType(str, enum.Enum):
    FULL_TIME = "FULL_TIME"
    PART_TIME = "PART_TIME"
    CONTRACT = "CONTRACT"
    INTERNSHIP = "INTERNSHIP"


class ApplicationStatus(str, enum.Enum):
    APPLIED = "APPLIED"
    SCREENING = "SCREENING"
    INTERVIEW_SCHEDULED = "INTERVIEW_SCHEDULED"
    INTERVIEWED = "INTERVIEWED"
    OFFERED = "OFFERED"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    WITHDRAWN = "WITHDRAWN"


class InterviewStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    RESCHEDULED = "RESCHEDULED"


class OnboardingTaskStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    SKIPPED = "SKIPPED"


class AuditAction(str, enum.Enum):
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    ROLE_ASSIGNED = "ROLE_ASSIGNED"
    HIRING_DECISION = "HIRING_DECISION"
    OVERRIDE = "OVERRIDE"
    JOB_POSTED = "JOB_POSTED"
    APPLICATION_SUBMITTED = "APPLICATION_SUBMITTED"


# Models
class Company(Base):
    __tablename__ = "companies"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(255), nullable=False)
    domain = Column(String(255), unique=True, nullable=False, index=True)
    logo_url = Column(Text)
    website = Column(Text)
    linkedin_url = Column(Text)
    diversity_policy = Column(Text)
    total_storage_used = Column(BigInteger, default=0)
    api_credits_used = Column(Integer, default=0)
    api_credits_limit = Column(Integer, default=10000)
    next_invoice_date = Column(DateTime(timezone=True))
    subscription_tier = Column(String(50), default="basic")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True))
    
    # Relationships
    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="company", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="company", cascade="all, delete-orphan")
    credit_usage = relationship("CreditUsage", back_populates="company", cascade="all, delete-orphan")
    oauth_tokens = relationship("OAuthToken", back_populates="company", cascade="all, delete-orphan")
    email_templates = relationship("EmailTemplate", back_populates="company", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    company_id = Column(PG_UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"))
    email = Column(String(255), nullable=False, index=True)
    password_hash = Column(String(255))
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20))
    avatar_url = Column(Text)
    is_email_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    is_password_set = Column(Boolean, default=False)
    email_verification_token = Column(String(255))
    email_verification_expires = Column(DateTime(timezone=True))
    password_reset_token = Column(String(255))
    password_reset_expires = Column(DateTime(timezone=True))
    last_login_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True))
    
    # Relationships
    company = relationship("Company", back_populates="users")
    roles = relationship("UserRoleAssignment", foreign_keys="[UserRoleAssignment.user_id]", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    candidate_profile = relationship("Candidate", back_populates="user", uselist=False, cascade="all, delete-orphan")
    created_jobs = relationship("Job", foreign_keys="Job.created_by", back_populates="creator")
    scheduled_interviews = relationship("Interview", foreign_keys="Interview.scheduled_by", back_populates="scheduler")
    assigned_onboarding = relationship("OnboardingTask", foreign_keys="OnboardingTask.assigned_to", back_populates="assignee")
    audit_logs = relationship("AuditLog", back_populates="user")
    credit_usage = relationship("CreditUsage", back_populates="user")
    oauth_tokens = relationship("OAuthToken", back_populates="user", cascade="all, delete-orphan")


class UserRoleAssignment(Base):
    __tablename__ = "user_roles"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    role = Column(Enum(UserRole, name='user_role', create_type=False), nullable=False)
    assigned_by = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"))
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        UniqueConstraint("user_id", "role", name="uq_user_role"),
        Index("idx_user_roles_user", "user_id"),
        Index("idx_user_roles_role", "role"),
    )
    
    # Relationships
    # FIXED! Using string references to the class and column
    user = relationship("User", foreign_keys="[UserRoleAssignment.user_id]", back_populates="roles")
    assigner = relationship("User", foreign_keys="[UserRoleAssignment.assigned_by]")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    token = Column(String(500), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    revoked_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User", back_populates="refresh_tokens")


class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    company_id = Column(PG_UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"))
    created_by = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"))
    job_title = Column(String(255), nullable=False)
    department = Column(String(100))
    employment_type = Column(Enum(EmploymentType, name='employment_type', create_type=False), nullable=False)
    location = Column(String(255))
    is_remote = Column(Boolean, default=False)
    compensation_min = Column(DECIMAL(12, 2))
    compensation_max = Column(DECIMAL(12, 2))
    currency = Column(String(3), default="USD")
    equity = Column(Text)
    direct_job_post = Column(Boolean, default=False)
    job_description = Column(Text)
    screening_questions = Column(JSONB)
    is_published = Column(Boolean, default=False)
    published_at = Column(DateTime(timezone=True))
    linkedin_job_url = Column(Text)
    career_page_url = Column(Text)
    unique_job_code = Column(String(50), unique=True, index=True)
    tokens_used = Column(Integer, default=0)
    status = Column(String(50), default="draft")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True))
    
    # Relationships
    company = relationship("Company", back_populates="jobs")
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_jobs")
    postings = relationship("JobPosting", back_populates="job", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")


class JobPosting(Base):
    __tablename__ = "job_postings"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    job_id = Column(PG_UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"))
    platform = Column(String(50), nullable=False)
    external_id = Column(String(255))
    post_url = Column(Text)
    posted_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(50), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    job = relationship("Job", back_populates="postings")


class Candidate(Base):
    __tablename__ = "candidates"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    linkedin_url = Column(Text)
    portfolio_url = Column(Text)
    years_of_experience = Column(Integer)
    current_company = Column(String(255))
    current_job_role = Column(String(255))
    skills = Column(JSONB)
    expected_salary_min = Column(DECIMAL(12, 2))
    expected_salary_max = Column(DECIMAL(12, 2))
    currency = Column(String(3), default="USD")
    availability_date = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="candidate_profile")
    applications = relationship("Application", back_populates="candidate", cascade="all, delete-orphan")


class Application(Base):
    __tablename__ = "applications"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    candidate_id = Column(PG_UUID(as_uuid=True), ForeignKey("candidates.id", ondelete="CASCADE"))
    job_id = Column(PG_UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"))
    resume_gcs_path = Column(Text, nullable=False)
    resume_filename = Column(String(255), nullable=False)
    resume_size = Column(BigInteger)
    cover_letter = Column(Text)
    screening_answers = Column(JSONB)
    status = Column(Enum(ApplicationStatus, name='application_status', create_type=False), default=ApplicationStatus.APPLIED)
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        UniqueConstraint("candidate_id", "job_id", name="uq_candidate_job"),
    )
    
    # Relationships
    candidate = relationship("Candidate", back_populates="applications")
    job = relationship("Job", back_populates="applications")
    evaluation = relationship("ResumeEvaluation", back_populates="application", uselist=False, cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="application", cascade="all, delete-orphan")
    onboarding_tasks = relationship("OnboardingTask", back_populates="application", cascade="all, delete-orphan")


class ResumeEvaluation(Base):
    __tablename__ = "resume_evaluations"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    application_id = Column(PG_UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), unique=True)
    parsed_data = Column(JSONB)
    ai_score = Column(DECIMAL(5, 2))
    ai_summary = Column(Text)
    strengths = Column(JSONB)
    weaknesses = Column(JSONB)
    recommendation = Column(String(50))
    tokens_used = Column(Integer, default=0)
    evaluated_at = Column(DateTime(timezone=True), server_default=func.now())
    evaluated_by_agent = Column(String(100))
    
    # Relationships
    application = relationship("Application", back_populates="evaluation")


class Interview(Base):
    __tablename__ = "interviews"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    application_id = Column(PG_UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"))
    scheduled_by = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"))
    interviewer_ids = Column(JSONB)
    interview_type = Column(String(50))
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, default=60)
    meeting_link = Column(Text)
    location = Column(Text)
    notes = Column(Text)
    status = Column(Enum(InterviewStatus, name='interview_status', create_type=False), default=InterviewStatus.SCHEDULED)
    feedback = Column(JSONB)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    application = relationship("Application", back_populates="interviews")
    scheduler = relationship("User", foreign_keys=[scheduled_by], back_populates="scheduled_interviews")


class OnboardingTask(Base):
    __tablename__ = "onboarding_tasks"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    application_id = Column(PG_UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"))
    task_name = Column(String(255), nullable=False)
    task_description = Column(Text)
    task_order = Column(Integer)
    assigned_to = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"))
    due_date = Column(Date)
    status = Column(Enum(OnboardingTaskStatus, name='onboarding_task_status', create_type=False), default=OnboardingTaskStatus.PENDING)
    completed_at = Column(DateTime(timezone=True))
    completed_by = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    application = relationship("Application", back_populates="onboarding_tasks")
    assignee = relationship("User", foreign_keys=[assigned_to], back_populates="assigned_onboarding")
    completer = relationship("User", foreign_keys=[completed_by])


class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    company_id = Column(PG_UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"))
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    action = Column(Enum(AuditAction, name='audit_action', create_type=False), nullable=False)
    resource_type = Column(String(100))
    resource_id = Column(PG_UUID(as_uuid=True))
    old_values = Column(JSONB)
    new_values = Column(JSONB)
    auditlog_metadata = Column("metadata", JSONB)
    ip_address = Column(INET)
    user_agent = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    company = relationship("Company", back_populates="audit_logs")
    user = relationship("User", back_populates="audit_logs")


class CreditUsage(Base):
    __tablename__ = "credit_usage"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    company_id = Column(PG_UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"))
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    operation = Column(String(100), nullable=False)
    
    # Detailed token tracking
    input_tokens = Column(Integer, nullable=False)  # Prompt/input tokens
    output_tokens = Column(Integer, nullable=False)  # Completion/output tokens
    total_tokens = Column(Integer, nullable=False)  # Total (input + output)
    
    cost_per_token = Column(DECIMAL(10, 8))
    total_cost = Column(DECIMAL(10, 4))
    resource_type = Column(String(50))
    resource_id = Column(PG_UUID(as_uuid=True))
    credit_usage_metadata = Column("metadata", JSONB)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    company = relationship("Company", back_populates="credit_usage")
    user = relationship("User", back_populates="credit_usage")


class OAuthToken(Base):
    __tablename__ = "oauth_tokens"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    company_id = Column(PG_UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"))
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    provider = Column(String(50), nullable=False)
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text)
    token_type = Column(String(50))
    expires_at = Column(DateTime(timezone=True))
    scope = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        UniqueConstraint("company_id", "provider", name="uq_company_provider"),
    )
    
    # Relationships
    company = relationship("Company", back_populates="oauth_tokens")
    user = relationship("User", back_populates="oauth_tokens")


class EmailTemplate(Base):
    __tablename__ = "email_templates"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    company_id = Column(PG_UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"))
    template_name = Column(String(100), nullable=False)
    subject = Column(String(255), nullable=False)
    body_html = Column(Text, nullable=False)
    body_text = Column(Text)
    variables = Column(JSONB)
    is_system = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        UniqueConstraint("company_id", "template_name", name="uq_company_template"),
    )
    
    # Relationships
    company = relationship("Company", back_populates="email_templates")


class EmailQueue(Base):
    __tablename__ = "email_queue"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    to_email = Column(String(255), nullable=False)
    cc_emails = Column(JSONB)
    bcc_emails = Column(JSONB)
    subject = Column(String(255), nullable=False)
    body_html = Column(Text, nullable=False)
    body_text = Column(Text)
    attachments = Column(JSONB)
    priority = Column(Integer, default=5)
    scheduled_at = Column(DateTime(timezone=True), server_default=func.now())
    sent_at = Column(DateTime(timezone=True))
    failed_at = Column(DateTime(timezone=True))
    error_message = Column(Text)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
