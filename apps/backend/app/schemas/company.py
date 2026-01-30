"""
Pydantic schemas for companies and users.
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, HttpUrl, field_validator


# Company Schemas
class CompanyBase(BaseModel):
    """Base schema for company data."""
    name: str = Field(..., min_length=1, max_length=255)
    domain: str = Field(..., min_length=1, max_length=255)
    website: Optional[HttpUrl] = None
    linkedin_url: Optional[HttpUrl] = None
    diversity_policy: Optional[str] = None
    subscription_tier: str = "basic"
    api_credits_limit: int = 10000


class CompanyCreate(CompanyBase):
    """Schema for creating a new company."""
    pass


class CompanyUpdate(BaseModel):
    """Schema for updating company data."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    website: Optional[HttpUrl] = None
    linkedin_url: Optional[HttpUrl] = None
    diversity_policy: Optional[str] = None
    subscription_tier: Optional[str] = None
    api_credits_limit: Optional[int] = None
    is_active: Optional[bool] = None


class CompanyResponse(CompanyBase):
    """Response schema for company data."""
    id: UUID
    logo_url: Optional[str]
    total_storage_used: int
    api_credits_used: int
    next_invoice_date: Optional[datetime]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    admin_status: Optional[str] = None  # Status of the company admin (INVITED, ACTIVE, DELETED)
    admin_email: Optional[str] = None  # Email of the company admin
    
    class Config:
        from_attributes = True


class CompanyDashboardMetrics(BaseModel):
    """Schema for company dashboard metrics."""
    company_id: UUID
    company_name: str
    total_employees: int
    total_storage_used: int
    api_credits_used: int
    api_credits_limit: int
    next_invoice_date: Optional[datetime]
    total_jobs: int
    total_applications: int


# User Management Schemas
class UserCreate(BaseModel):
    """Schema for creating a new user (by Admin)."""
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)
    role: str = Field(..., description="ADMIN or HR")
    
    @field_validator('role')
    @classmethod
    def validate_role(cls, v: str) -> str:
        """Validate role is ADMIN or HR."""
        if v not in ["ADMIN", "HR"]:
            raise ValueError("Role must be either ADMIN or HR")
        return v


class UserUpdate(BaseModel):
    """Schema for updating user data."""
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None


class UserListItem(BaseModel):
    """Schema for user in list responses."""
    id: UUID
    email: EmailStr
    full_name: str
    phone: Optional[str]
    roles: List[str]
    is_email_verified: bool
    is_active: bool
    is_password_set: bool
    status: Optional[str] = None  # INVITED, ACTIVE, DELETED
    last_login_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


class PaginatedUserResponse(BaseModel):
    """Schema for paginated user list."""
    items: List[UserListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


# Pagination Helper
class PaginationParams(BaseModel):
    """Common pagination parameters."""
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(25, ge=1, le=100, description="Items per page")
    
    @property
    def offset(self) -> int:
        """Calculate offset for database query."""
        return (self.page - 1) * self.page_size
