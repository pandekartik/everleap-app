"""
Authentication API endpoints.
Handles login, registration, password management, and token refresh.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request, status, Form, Query
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from jose import JWTError
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.rbac import CurrentUser, get_current_user
from core.security import (
    create_access_token,
    create_email_verification_token,
    create_password_reset_token,
    create_refresh_token,
    get_password_hash,
    verify_email_verification_token,
    verify_password,
    verify_password_reset_token,
    verify_token_type,
)
from db.session import get_db
from models import Candidate, RefreshToken, User, UserRole, UserRoleAssignment
from schemas.auth import (
    EmailVerificationRequest,
    LoginRequest,
    LoginUserInfo,
    PasswordResetConfirm,
    PasswordResetRequest,
    RefreshTokenRequest,
    RegisterRequest,
    SetPasswordRequest,
    TokenResponse,
    UserResponse,
)
from services.audit import audit_service
from services.email import email_service


router = APIRouter(prefix="/auth", tags=["Authentication"])

# Setup templates
templates = Jinja2Templates(directory=str(Path(__file__).parent.parent.parent.parent / "templates"))  # ✅ FIXED

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_candidate(
    request: Request,
    registration: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new candidate account.
    Creates user, candidate profile, and sends verification email.
    """
    # Check if email already exists
    existing_user = await db.execute(
        select(User).where(User.email == registration.email, User.deleted_at.is_(None))
    )
    if existing_user.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user = User(
        email=registration.email,
        password_hash=get_password_hash(registration.password),
        full_name=registration.full_name,
        phone=registration.phone,
        is_password_set=True,
        is_active=True
    )
    db.add(user)
    await db.flush()
    
    # Assign CANDIDATE role
    role_assignment = UserRoleAssignment(
        user_id=user.id,
        role=UserRole.CANDIDATE
    )
    db.add(role_assignment)
    
    # Create candidate profile
    candidate = Candidate(user_id=user.id)
    db.add(candidate)
    
    # Generate verification token
    verification_token = create_email_verification_token(user.email)
    user.email_verification_token = verification_token
    user.email_verification_expires = datetime.now(timezone.utc) + timedelta(hours=24)
    
    await db.commit()
    await db.refresh(user)
    
    # Send verification email using template
    verification_link = f"{settings.BACKEND_URL}/api/v1/auth/verify-email?token={verification_token}"
    await email_service.send_templated_email(
        db=db,
        to_email=user.email,
        template_name="email_verification",
        context={
            "user_name": user.full_name,
            "verification_link": verification_link
        }
    )
    
    # Create tokens
    access_token = create_access_token(subject=user.id)
    refresh_token_str = create_refresh_token(subject=user.id)
    
    # Store refresh token
    refresh_token = RefreshToken(
        user_id=user.id,
        token=refresh_token_str,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(refresh_token)
    await db.commit()
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_str
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Authenticate user and return access/refresh tokens.
    """
    # Find user
    result = await db.execute(
        select(User).where(
            User.email == credentials.email,
            User.deleted_at.is_(None)
        )
    )
    user = result.scalar_one_or_none()
    
    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Update last login
    await db.execute(
        update(User).where(User.id == user.id).values(
            last_login_at=datetime.now(timezone.utc)
        )
    )
    await db.commit()
    
    # Log login
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    await audit_service.log_login(
        db=db,
        user_id=user.id,
        company_id=user.company_id,
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    # Create tokens
    access_token = create_access_token(subject=user.id)
    refresh_token_str = create_refresh_token(subject=user.id)
    
    # Store refresh token
    refresh_token = RefreshToken(
        user_id=user.id,
        token=refresh_token_str,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(refresh_token)
    await db.commit()
    
    # Fetch user roles
    roles_result = await db.execute(
        select(UserRoleAssignment.role).where(UserRoleAssignment.user_id == user.id)
    )
    roles = [row[0].value for row in roles_result.all()]
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_str,
        user=LoginUserInfo(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            roles=roles
        )
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh access token using refresh token.
    """
    try:
        # Verify refresh token
        payload = verify_token_type(refresh_data.refresh_token, "refresh")
        user_id = payload.get("sub")
        
        # Check if refresh token exists and is not revoked
        result = await db.execute(
            select(RefreshToken).where(
                RefreshToken.token == refresh_data.refresh_token,
                RefreshToken.revoked_at.is_(None)
            )
        )
        stored_token = result.scalar_one_or_none()
        
        if not stored_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Check expiration
        if stored_token.expires_at < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token expired"
            )
        
        # Create new tokens
        access_token = create_access_token(subject=user_id)
        new_refresh_token = create_refresh_token(subject=user_id)
        
        # Revoke old refresh token
        await db.execute(
            update(RefreshToken).where(
                RefreshToken.id == stored_token.id
            ).values(revoked_at=datetime.now(timezone.utc))
        )
        
        # Store new refresh token
        new_token_record = RefreshToken(
            user_id=stored_token.user_id,
            token=new_refresh_token,
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        )
        db.add(new_token_record)
        await db.commit()
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token
        )
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


@router.post("/set-password")
async def set_password(
    password_data: SetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Set password for invited user.
    Used when admin invites a user and they need to create their password.
    """
    try:
        # Verify token (using email verification token for this)
        email = verify_email_verification_token(password_data.token)
        
        # Find user
        result = await db.execute(
            select(User).where(
                User.email == email,
                User.deleted_at.is_(None)
            )
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check token expiration
        if user.email_verification_expires and user.email_verification_expires < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token expired"
            )
        
        # Update password
        await db.execute(
            update(User).where(User.id == user.id).values(
                password_hash=get_password_hash(password_data.password),
                is_password_set=True,
                is_email_verified=True,
                email_verification_token=None,
                email_verification_expires=None
            )
        )
        await db.commit()
        
        return {"message": "Password set successfully"}
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )

@router.get("/set-password", response_class=HTMLResponse)
async def set_password_page(
    request: Request,
    token: str = Query(..., description="Activation token"),
    db: AsyncSession = Depends(get_db)
):
    """
    Serve set-password form page.
    User clicks activation link in welcome email and lands here.
    
    URL: http://34.14.169.188:8000/api/v1/auth/set-password?token=xxx
    """
    try:
        # Verify token to get user info
        email = verify_email_verification_token(token)
        
        # Find user
        result = await db.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return templates.TemplateResponse("set_password_error.html", {
                "request": request,
                "support_email": "support@everleap.com",
                "home_url": settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else "/"
            })
        
        # Check if token is expired
        if user.email_verification_expires and user.email_verification_expires < datetime.now(timezone.utc):
            return templates.TemplateResponse("set_password_error.html", {
                "request": request,
                "support_email": "support@everleap.com",
                "home_url": settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else "/"
            })
        
        # Show set-password form
        return templates.TemplateResponse("set_password.html", {
            "request": request,
            "token": token,
            "user_name": user.full_name
        })
        
    except JWTError:
        return templates.TemplateResponse("set_password_error.html", {
            "request": request,
            "support_email": "support@everleap.com",
            "home_url": settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else "/"
        })


@router.get("/set-password-success", response_class=HTMLResponse)
async def set_password_success_page(request: Request):
    """
    Success page after password is set.
    User is redirected here after successfully setting password.
    
    URL: http://34.14.169.188:8000/api/v1/auth/set-password-success
    """
    return templates.TemplateResponse("set_password_success.html", {
        "request": request,
        "login_url": f"{settings.FRONTEND_URL}/login" if hasattr(settings, 'FRONTEND_URL') else "/login"
    })

# ============================================================================
# GET ENDPOINT: Email Verification (Browser-based)
# ============================================================================
@router.get("/verify-email", response_class=HTMLResponse)
async def verify_email_get(
    request: Request,
    token: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Verify user email address (GET endpoint for browser).
    User clicks link in email and is redirected here.
    """
    try:
        email = verify_email_verification_token(token)
        
        # Find user
        result = await db.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return templates.TemplateResponse("verify_error.html", {
                "request": request,
                "error": "User not found"
            })
        
        # Check if already verified
        if user.is_email_verified:
            return templates.TemplateResponse("verify_success.html", {
                "request": request,
                "user_name": user.full_name,
                "message": "Your email is already verified!",
                "login_url": f"{settings.FRONTEND_URL}/login"
            })
        
        # Update user
        await db.execute(
            update(User).where(User.id == user.id).values(
                is_email_verified=True,
                email_verification_token=None,
                email_verification_expires=None
            )
        )
        await db.commit()
        
        return templates.TemplateResponse("verify_success.html", {
            "request": request,
            "user_name": user.full_name,
            "message": "Email verified successfully!",
            "login_url": f"{settings.FRONTEND_URL}/login"
        })
        
    except JWTError:
        return templates.TemplateResponse("verify_error.html", {
            "request": request,
            "error": "Invalid or expired verification link"
        })


# ============================================================================
# POST ENDPOINT: Email Verification (API-based)
# ============================================================================
@router.post("/verify-email")
async def verify_email_post(
    verification: EmailVerificationRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Verify user email address (POST endpoint for API).
    """
    try:
        email = verify_email_verification_token(verification.token)
        
        # Find user
        result = await db.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update user
        await db.execute(
            update(User).where(User.id == user.id).values(
                is_email_verified=True,
                email_verification_token=None,
                email_verification_expires=None
            )
        )
        await db.commit()
        
        return {"message": "Email verified successfully"}
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )


@router.post("/request-password-reset")
async def request_password_reset(
    reset_request: PasswordResetRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Request password reset link.
    """
    # Find user (don't reveal if email exists)
    result = await db.execute(
        select(User).where(
            User.email == reset_request.email,
            User.deleted_at.is_(None)
        )
    )
    user = result.scalar_one_or_none()
    
    if user:
        # Generate reset token
        reset_token = create_password_reset_token(user.email)
        
        # Update user
        await db.execute(
            update(User).where(User.id == user.id).values(
                password_reset_token=reset_token,
                password_reset_expires=datetime.now(timezone.utc) + timedelta(hours=1)
            )
        )
        await db.commit()
        
        # Send reset email using template
        reset_link = f"{settings.BACKEND_URL}/api/v1/auth/reset-password?token={reset_token}"
        await email_service.send_templated_email(
            db=db,
            to_email=user.email,
            template_name="password_reset",
            context={
                "user_name": user.full_name,
                "reset_link": reset_link
            },
            company_id=user.company_id
        )
    
    # Always return success to prevent email enumeration
    return {"message": "If the email exists, a reset link has been sent"}


# ============================================================================
# GET ENDPOINT: Password Reset Form (Browser-based)
# ============================================================================
@router.get("/reset-password", response_class=HTMLResponse)
async def reset_password_form(
    request: Request,
    token: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Show password reset form (GET endpoint for browser).
    User clicks link in email and is shown a form to enter new password.
    """
    try:
        email = verify_password_reset_token(token)
        
        # Find user
        result = await db.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return templates.TemplateResponse("reset_error.html", {
                "request": request,
                "error": "User not found"
            })
        
        # Check token expiration
        if user.password_reset_expires and user.password_reset_expires < datetime.now(timezone.utc):
            return templates.TemplateResponse("reset_error.html", {
                "request": request,
                "error": "Password reset link has expired"
            })
        
        return templates.TemplateResponse("reset_password.html", {
            "request": request,
            "token": token,
            "user_name": user.full_name
        })
        
    except JWTError:
        return templates.TemplateResponse("reset_error.html", {
            "request": request,
            "error": "Invalid password reset link"
        })


# ============================================================================
# POST ENDPOINT: Password Reset Submit (Form submission)
# ============================================================================
@router.post("/reset-password", response_class=HTMLResponse)
async def reset_password_submit(
    request: Request,
    token: str = Form(...),
    new_password: str = Form(...),
    confirm_password: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Process password reset form submission.
    """
    # Validate passwords match
    if new_password != confirm_password:
        return templates.TemplateResponse("reset_password.html", {
            "request": request,
            "token": token,
            "error": "Passwords do not match"
        })
    
    # Validate password strength
    if len(new_password) < 8:
        return templates.TemplateResponse("reset_password.html", {
            "request": request,
            "token": token,
            "error": "Password must be at least 8 characters long"
        })
    
    try:
        email = verify_password_reset_token(token)
        
        # Find user
        result = await db.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return templates.TemplateResponse("reset_error.html", {
                "request": request,
                "error": "User not found"
            })
        
        # Check token expiration
        if user.password_reset_expires and user.password_reset_expires < datetime.now(timezone.utc):
            return templates.TemplateResponse("reset_error.html", {
                "request": request,
                "error": "Password reset link has expired"
            })
        
        # Update password
        await db.execute(
            update(User).where(User.id == user.id).values(
                password_hash=get_password_hash(new_password),
                password_reset_token=None,
                password_reset_expires=None
            )
        )
        await db.commit()
        
        return templates.TemplateResponse("reset_success.html", {
            "request": request,
            "user_name": user.full_name,
            "login_url": f"{settings.FRONTEND_URL}/login"
        })
        
    except JWTError:
        return templates.TemplateResponse("reset_error.html", {
            "request": request,
            "error": "Invalid or expired password reset link"
        })


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current authenticated user information.
    """
    result = await db.execute(
        select(User).where(User.id == current_user.id)
    )
    user = result.scalar_one()
    
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        company_id=user.company_id,
        roles=[role.value for role in current_user.roles],
        is_email_verified=user.is_email_verified,
        is_active=user.is_active,
        is_password_set=user.is_password_set,
        last_login_at=user.last_login_at,
        created_at=user.created_at
    )


@router.post("/logout")
async def logout(
    refresh_data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Logout user by revoking refresh token.
    """
    # Revoke refresh token
    await db.execute(
        update(RefreshToken).where(
            RefreshToken.token == refresh_data.refresh_token
        ).values(revoked_at=datetime.now(timezone.utc))
    )
    await db.commit()
    
    return {"message": "Logged out successfully"}