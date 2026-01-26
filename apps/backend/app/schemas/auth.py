"""
Pydantic schemas for authentication endpoints.
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator


class LoginUserInfo(BaseModel):
    """User info included in login response."""
    id: UUID
    email: EmailStr
    full_name: str
    roles: List[str]


class TokenResponse(BaseModel):
    """Response schema for login endpoints."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Optional[LoginUserInfo] = None


class RefreshTokenRequest(BaseModel):
    """Request schema for token refresh."""
    refresh_token: str


class LoginRequest(BaseModel):
    """Request schema for user login."""
    email: EmailStr
    password: str = Field(..., min_length=8)


class RegisterRequest(BaseModel):
    """Request schema for candidate registration."""
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength."""
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(char.islower() for char in v):
            raise ValueError('Password must contain at least one lowercase letter')
        return v


class SetPasswordRequest(BaseModel):
    """Request schema for setting password after invitation."""
    token: str
    password: str = Field(..., min_length=8)
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength."""
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(char.islower() for char in v):
            raise ValueError('Password must contain at least one lowercase letter')
        return v


class PasswordResetRequest(BaseModel):
    """Request schema for password reset initiation."""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Request schema for password reset confirmation."""
    token: str
    new_password: str = Field(..., min_length=8)


class EmailVerificationRequest(BaseModel):
    """Request schema for email verification."""
    token: str


class UserResponse(BaseModel):
    """Response schema for user data."""
    id: UUID
    email: EmailStr
    full_name: str
    phone: Optional[str]
    company_id: Optional[UUID]
    roles: List[str]
    is_email_verified: bool
    is_active: bool
    is_password_set: bool
    last_login_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserWithCompanyResponse(UserResponse):
    """Response schema for user data with company info."""
    company_name: Optional[str]
    company_domain: Optional[str]
