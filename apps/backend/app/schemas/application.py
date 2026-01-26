"""
Pydantic schemas for applications and candidates.
"""
from datetime import date, datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, HttpUrl, field_validator


# Candidate Schemas
class CandidateProfileCreate(BaseModel):
    """Schema for creating candidate profile."""
    linkedin_url: Optional[HttpUrl] = None
    portfolio_url: Optional[HttpUrl] = None
    years_of_experience: Optional[int] = Field(None, ge=0, le=50)
    current_company: Optional[str] = Field(None, max_length=255)
    current_job_role: Optional[str] = Field(None, max_length=255)
    skills: Optional[List[str]] = None
    expected_salary_min: Optional[Decimal] = Field(None, ge=0)
    expected_salary_max: Optional[Decimal] = Field(None, ge=0)
    currency: str = Field("USD", min_length=3, max_length=3)
    availability_date: Optional[date] = None


class CandidateProfileUpdate(CandidateProfileCreate):
    """Schema for updating candidate profile."""
    pass


class CandidateProfileResponse(BaseModel):
    """Response schema for candidate profile."""
    id: UUID
    user_id: UUID
    linkedin_url: Optional[str]
    portfolio_url: Optional[str]
    years_of_experience: Optional[int]
    current_company: Optional[str]
    current_job_role: Optional[str]
    skills: Optional[List[str]]
    expected_salary_min: Optional[Decimal]
    expected_salary_max: Optional[Decimal]
    currency: str
    availability_date: Optional[date]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Application Schemas
class ScreeningAnswer(BaseModel):
    """Schema for a screening question answer."""
    question: str
    answer: str


class ApplicationCreate(BaseModel):
    """Schema for creating a job application."""
    job_id: UUID
    cover_letter: Optional[str] = Field(None, max_length=5000)
    screening_answers: Optional[List[ScreeningAnswer]] = None


class ApplicationUpdateStatus(BaseModel):
    """Schema for updating application status."""
    status: str = Field(..., description="APPLIED, SCREENING, INTERVIEW_SCHEDULED, INTERVIEWED, OFFERED, ACCEPTED, REJECTED, WITHDRAWN")
    notes: Optional[str] = None
    
    @field_validator('status')
    @classmethod
    def validate_status(cls, v: str) -> str:
        """Validate application status."""
        valid_statuses = [
            "APPLIED", "SCREENING", "INTERVIEW_SCHEDULED", "INTERVIEWED",
            "OFFERED", "ACCEPTED", "REJECTED", "WITHDRAWN"
        ]
        if v not in valid_statuses:
            raise ValueError(f"Status must be one of: {', '.join(valid_statuses)}")
        return v


class ApplicationResponse(BaseModel):
    """Response schema for application."""
    id: UUID
    candidate_id: UUID
    job_id: UUID
    resume_gcs_path: str
    resume_filename: str
    resume_size: int
    cover_letter: Optional[str]
    screening_answers: Optional[List[Dict[str, Any]]]
    status: str
    applied_at: datetime
    updated_at: datetime
    
    # Candidate info
    candidate_name: Optional[str] = None
    candidate_email: Optional[EmailStr] = None
    
    # Job info
    job_title: Optional[str] = None
    
    class Config:
        from_attributes = True


class ApplicationListItem(BaseModel):
    """Schema for application in list responses."""
    id: UUID
    candidate_id: UUID
    job_id: UUID
    resume_filename: str
    status: str
    applied_at: datetime
    
    # Candidate info
    candidate_name: str
    candidate_email: EmailStr
    candidate_phone: Optional[str]
    
    # Job info
    job_title: str
    job_location: str
    
    # Evaluation info
    ai_score: Optional[Decimal] = None
    recommendation: Optional[str] = None
    
    class Config:
        from_attributes = True


class PaginatedApplicationResponse(BaseModel):
    """Schema for paginated application list."""
    items: List[ApplicationListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class ResumeEvaluationResponse(BaseModel):
    """Response schema for resume evaluation."""
    id: UUID
    application_id: UUID
    parsed_data: Optional[Dict[str, Any]]
    ai_score: Optional[Decimal]
    ai_summary: Optional[str]
    strengths: Optional[List[str]]
    weaknesses: Optional[List[str]]
    recommendation: Optional[str]
    tokens_used: int
    evaluated_at: datetime
    evaluated_by_agent: Optional[str]
    
    class Config:
        from_attributes = True


# Interview Schemas
class InterviewCreate(BaseModel):
    """Schema for scheduling an interview."""
    application_id: UUID
    interviewer_ids: List[UUID] = Field(..., min_length=1)
    interview_type: str = Field(..., description="phone_screen, technical, cultural, final")
    scheduled_at: datetime
    duration_minutes: int = Field(60, ge=15, le=480)
    meeting_link: Optional[HttpUrl] = None
    location: Optional[str] = None
    notes: Optional[str] = None


class InterviewUpdate(BaseModel):
    """Schema for updating an interview."""
    interviewer_ids: Optional[List[UUID]] = None
    interview_type: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=15, le=480)
    meeting_link: Optional[HttpUrl] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    feedback: Optional[Dict[str, Any]] = None


class InterviewResponse(BaseModel):
    """Response schema for interview."""
    id: UUID
    application_id: UUID
    scheduled_by: UUID
    interviewer_ids: List[UUID]
    interview_type: str
    scheduled_at: datetime
    duration_minutes: int
    meeting_link: Optional[str]
    location: Optional[str]
    notes: Optional[str]
    status: str
    feedback: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    
    # Candidate info
    candidate_name: Optional[str] = None
    job_title: Optional[str] = None
    
    class Config:
        from_attributes = True


class InterviewListItem(BaseModel):
    """Schema for interview in list responses."""
    id: UUID
    application_id: UUID
    interview_type: str
    scheduled_at: datetime
    duration_minutes: int
    status: str
    candidate_name: str
    candidate_email: EmailStr
    job_title: str
    
    class Config:
        from_attributes = True


class PaginatedInterviewResponse(BaseModel):
    """Schema for paginated interview list."""
    items: List[InterviewListItem]
    total: int
    page: int
    page_size: int
    total_pages: int
