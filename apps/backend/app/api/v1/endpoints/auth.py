"""
Authentication API endpoints.
Handles login, registration, password management, and token refresh.
"""
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
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
        select(User).where(User.email == registration.email)
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
    user.email_verification_expires = datetime.utcnow() + timedelta(hours=24)
    
    await db.commit()
    await db.refresh(user)
    
    # Send verification email
    verification_link = f"{settings.EMAIL_VERIFICATION_URL}?token={verification_token}"
    await email_service.send_email(
        to_email=user.email,
        subject="Verify your email",
        body_html=f"<p>Please verify your email by clicking: <a href='{verification_link}'>Verify Email</a></p>",
        body_text=f"Please verify your email: {verification_link}"
    )
    
    # Create tokens
    access_token = create_access_token(subject=user.id)
    refresh_token_str = create_refresh_token(subject=user.id)
    
    # Store refresh token
    refresh_token = RefreshToken(
        user_id=user.id,
        token=refresh_token_str,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
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
            last_login_at=datetime.utcnow()
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
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
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
        if stored_token.expires_at < datetime.utcnow():
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
            ).values(revoked_at=datetime.utcnow())
        )
        
        # Store new refresh token
        new_token_record = RefreshToken(
            user_id=stored_token.user_id,
            token=new_refresh_token,
            expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
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
        if user.email_verification_expires and user.email_verification_expires < datetime.utcnow():
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


@router.post("/verify-email")
async def verify_email(
    verification: EmailVerificationRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Verify user email address.
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
                password_reset_expires=datetime.utcnow() + timedelta(hours=1)
            )
        )
        await db.commit()
        
        # Send reset email
        reset_link = f"{settings.PASSWORD_RESET_URL}?token={reset_token}"
        await email_service.send_email(
            to_email=user.email,
            subject="Password Reset Request",
            body_html=f"<p>Reset your password: <a href='{reset_link}'>Reset Password</a></p>",
            body_text=f"Reset your password: {reset_link}"
        )
    
    # Always return success to prevent email enumeration
    return {"message": "If the email exists, a reset link has been sent"}


@router.post("/reset-password")
async def reset_password(
    reset_data: PasswordResetConfirm,
    db: AsyncSession = Depends(get_db)
):
    """
    Reset password using reset token.
    """
    try:
        email = verify_password_reset_token(reset_data.token)
        
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
        
        # Check token expiration
        if user.password_reset_expires and user.password_reset_expires < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token expired"
            )
        
        # Update password
        await db.execute(
            update(User).where(User.id == user.id).values(
                password_hash=get_password_hash(reset_data.new_password),
                password_reset_token=None,
                password_reset_expires=None
            )
        )
        await db.commit()
        
        return {"message": "Password reset successfully"}
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )


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
        ).values(revoked_at=datetime.utcnow())
    )
    await db.commit()
    
    return {"message": "Logged out successfully"}
