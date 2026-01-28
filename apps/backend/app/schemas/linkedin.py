"""
Pydantic schemas for LinkedIn Unipile integration.
Add to schemas/linkedin.py
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


# ============================================================================
# ACCOUNT CONNECTION SCHEMAS
# ============================================================================

class LinkedInConnectResponse(BaseModel):
    """Response when initiating LinkedIn connection."""
    authorization_url: str = Field(..., description="URL to redirect user to for OAuth")
    expires_at: Optional[str] = Field(None, description="When the link expires")
    message: str = Field(default="Please complete authorization in the opened window")


class LinkedInProfile(BaseModel):
    """LinkedIn profile information."""
    id: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    username: Optional[str] = None


class LinkedInOrganization(BaseModel):
    """LinkedIn organization (company page)."""
    id: str = Field(..., description="Organization ID")
    name: str = Field(..., description="Organization name")
    vanity_name: Optional[str] = Field(None, description="Vanity URL name")
    logo_url: Optional[str] = Field(None, description="Logo URL")
    follower_count: Optional[int] = Field(None, description="Number of followers")


class LinkedInStatusResponse(BaseModel):
    """LinkedIn connection status."""
    connected: bool = Field(..., description="Whether LinkedIn is connected")
    account_id: Optional[str] = Field(None, description="Unipile account ID")
    profile: Optional[dict] = Field(None, description="Profile information")
    organizations: List[LinkedInOrganization] = Field(default_factory=list, description="Company pages user can post to")
    expires_at: Optional[datetime] = Field(None, description="When connection expires")
    requires_connection: bool = Field(default=False, description="Whether connection is needed")
    error: Optional[str] = None


class LinkedInOrganizationsResponse(BaseModel):
    """Response with list of organizations."""
    organizations: List[LinkedInOrganization] = Field(default_factory=list)
    count: int = Field(..., description="Number of organizations")


# ============================================================================
# ACCOUNT MANAGEMENT SCHEMAS
# ============================================================================

class LinkedInAccount(BaseModel):
    """LinkedIn account information."""
    id: str = Field(..., description="Unipile account ID")
    provider: str = Field(default="LINKEDIN")
    provider_id: Optional[str] = Field(None, description="LinkedIn user ID")
    username: Optional[str] = Field(None, description="LinkedIn email/username")
    display_name: Optional[str] = Field(None, description="Display name")
    email: Optional[str] = Field(None, description="Email address")
    connected_at: Optional[str] = Field(None, description="When account was connected")


class LinkedInAccountsListResponse(BaseModel):
    """Response with list of all LinkedIn accounts."""
    accounts: List[LinkedInAccount] = Field(default_factory=list)
    count: int = Field(..., description="Total number of accounts")


class DeleteAccountRequest(BaseModel):
    """Request to delete an account."""
    account_id: str = Field(..., description="Unipile account ID to delete")


class DeleteAccountResponse(BaseModel):
    """Response after deleting account."""
    success: bool
    message: str
    warning: Optional[str] = None


# ============================================================================
# JOB POSTING SCHEMAS
# ============================================================================

class PostJobToLinkedInRequest(BaseModel):
    """Request to post job to LinkedIn."""
    job_id: UUID = Field(..., description="Job ID from jobs table")
    organization_id: Optional[str] = Field(None, description="LinkedIn organization ID (for company page posting)")
    workplace_type: str = Field(default="ONSITE", description="ONSITE, REMOTE, or HYBRID")
    company_apply_url: Optional[str] = Field(None, description="Alternative apply URL")


class PostJobToLinkedInResponse(BaseModel):
    """Response after posting job to LinkedIn."""
    success: bool
    job_posting_id: Optional[str] = Field(None, description="LinkedIn job posting ID")
    url: Optional[str] = Field(None, description="LinkedIn job URL")
    status: Optional[str] = Field(None, description="Job status (OPEN, CLOSED)")
    posted_at: Optional[int] = Field(None, description="Timestamp when posted")
    error: Optional[str] = None
    requires_connection: bool = Field(default=False, description="Whether LinkedIn connection is needed")


class LinkedInJobStatus(BaseModel):
    """LinkedIn job posting status."""
    job_id: UUID
    posted_to_linkedin: bool
    linkedin_job_id: Optional[str] = None
    linkedin_url: Optional[str] = None
    posted_at: Optional[datetime] = None


class DeleteJobPostingRequest(BaseModel):
    """Request to delete LinkedIn job posting."""
    job_id: UUID = Field(..., description="Job ID")


class DeleteJobPostingResponse(BaseModel):
    """Response after deleting job posting."""
    success: bool
    message: str
    error: Optional[str] = None