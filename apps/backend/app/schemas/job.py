"""
Pydantic schemas for jobs and job postings.
"""
from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class ScreeningQuestion(BaseModel):
    """Schema for a single screening question."""
    question: str = Field(..., min_length=5, max_length=500)
    required: bool = True
    order: int = Field(..., ge=1)


class JobCreate(BaseModel):
    """Schema for creating a new job."""
    job_title: str = Field(..., min_length=2, max_length=255)
    department: Optional[str] = Field(None, max_length=100)
    employment_type: str = Field(..., description="FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP")
    location: str = Field(..., min_length=2, max_length=255)
    is_remote: bool = False
    compensation_min: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    compensation_max: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    currency: str = Field("USD", min_length=3, max_length=3)
    equity: Optional[str] = None
    direct_job_post: bool = False
    screening_questions: Optional[List[ScreeningQuestion]] = None
    
    @field_validator('employment_type')
    @classmethod
    def validate_employment_type(cls, v: str) -> str:
        """Validate employment type."""
        valid_types = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]
        if v not in valid_types:
            raise ValueError(f"Employment type must be one of: {', '.join(valid_types)}")
        return v
    
    @field_validator('compensation_max')
    @classmethod
    def validate_compensation_range(cls, v: Optional[Decimal], info) -> Optional[Decimal]:
        """Validate that max compensation is greater than min."""
        if v is not None and 'compensation_min' in info.data:
            min_comp = info.data['compensation_min']
            if min_comp is not None and v < min_comp:
                raise ValueError("compensation_max must be greater than or equal to compensation_min")
        return v


class JobUpdate(BaseModel):
    """Schema for updating a job."""
    job_title: Optional[str] = Field(None, min_length=2, max_length=255)
    department: Optional[str] = Field(None, max_length=100)
    employment_type: Optional[str] = None
    location: Optional[str] = Field(None, min_length=2, max_length=255)
    is_remote: Optional[bool] = None
    compensation_min: Optional[Decimal] = Field(None, ge=0)
    compensation_max: Optional[Decimal] = Field(None, ge=0)
    equity: Optional[str] = None
    job_description: Optional[str] = None
    screening_questions: Optional[List[ScreeningQuestion]] = None
    status: Optional[str] = None


class JobDescriptionGenerated(BaseModel):
    """Schema for AI-generated job description."""
    job_description: str
    tokens_used: int


class JobPublishRequest(BaseModel):
    """Schema for publishing a job."""
    post_to_linkedin: bool = False
    use_free_posting: bool = True  # For LinkedIn: True = free, False = promoted
    daily_budget: Optional[float] = None  # Required if use_free_posting=False


class JobResponse(BaseModel):
    """Response schema for job data."""
    id: UUID
    company_id: UUID
    created_by: UUID
    job_title: str
    department: Optional[str]
    employment_type: str
    location: str
    is_remote: bool
    compensation_min: Optional[Decimal]
    compensation_max: Optional[Decimal]
    currency: str
    equity: Optional[str]
    direct_job_post: bool
    job_description: Optional[str]
    screening_questions: Optional[List[Dict[str, Any]]]
    is_published: bool
    published_at: Optional[datetime]
    linkedin_job_url: Optional[str]
    career_page_url: Optional[str]
    unique_job_code: str
    tokens_used: int
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class JobListItem(BaseModel):
    """Schema for job in list responses."""
    id: UUID
    job_title: str
    department: Optional[str]
    employment_type: str
    location: str
    is_remote: bool
    compensation_min: Optional[Decimal]
    compensation_max: Optional[Decimal]
    currency: str
    is_published: bool
    published_at: Optional[datetime]
    unique_job_code: str
    status: str
    total_applications: int = 0
    created_at: datetime
    
    class Config:
        from_attributes = True


class PaginatedJobResponse(BaseModel):
    """Schema for paginated job list."""
    items: List[JobListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class JobPostingResponse(BaseModel):
    """Response schema for job posting."""
    id: UUID
    job_id: UUID
    platform: str
    external_id: Optional[str]
    post_url: Optional[str]
    posted_at: datetime
    status: str
    
    class Config:
        from_attributes = True


class JobApplicationStats(BaseModel):
    """Schema for job application statistics."""
    job_id: UUID
    job_title: str
    total_applications: int
    new_applications: int
    in_screening: int
    interview_scheduled: int
    offers_made: int
    offers_accepted: int
    rejected: int
