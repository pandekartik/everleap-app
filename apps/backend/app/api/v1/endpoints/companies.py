"""
Company and organization management API endpoints.
Handles company creation, user management, and dashboard metrics.
"""
from datetime import datetime, timedelta, timezone
from math import ceil
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.rbac import CurrentUser, get_current_verified_user, check_company_access
from core.security import create_email_verification_token, get_password_hash
from db.session import get_db
from models import Application, AuditAction, Company, Job, User, UserRole, UserRoleAssignment, UserStatus
from schemas.company import (
    CompanyCreate,
    CompanyDashboardMetrics,
    CompanyResponse,
    CompanyUpdate,
    PaginatedUserResponse,
    PaginationParams,
    UserCreate,
    UserListItem,
    UserUpdate,
)
from services.audit import audit_service
from services.email import email_service


router = APIRouter(prefix="/companies", tags=["Companies"])


@router.post("", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(
    request: Request,
    company_data: CompanyCreate,
    current_user: CurrentUser = Depends(get_current_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new company (SUPER_ADMIN only).
    """
    if not current_user.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admins can create companies"
        )
    
    # Check if domain already exists
    existing = await db.execute(
        select(Company).where(Company.domain == company_data.domain)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company with this domain already exists"
        )
    
    # Create company
    company = Company(
        name=company_data.name,
        domain=company_data.domain,
        website=str(company_data.website) if company_data.website else None,
        linkedin_url=str(company_data.linkedin_url) if company_data.linkedin_url else None,
        diversity_policy=company_data.diversity_policy,
        subscription_tier=company_data.subscription_tier,
        api_credits_limit=company_data.api_credits_limit,
        next_invoice_date=datetime.now(timezone.utc) + timedelta(days=30)
    )
    
    db.add(company)
    await db.commit()
    await db.refresh(company)
    
    # Log company creation
    ip_address = request.client.host if request.client else None
    await audit_service.log_action(
        db=db,
        action="CREATE",
        company_id=company.id,
        user_id=current_user.id,
        resource_type="company",
        resource_id=company.id,
        new_values={"name": company.name, "domain": company.domain},
        ip_address=ip_address
    )
    
    return company


@router.get("", response_model=list[CompanyResponse])
async def list_companies(
    current_user: CurrentUser = Depends(get_current_verified_user),
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(25, ge=1, le=100)
):
    """
    List all companies (SUPER_ADMIN only).
    """
    if not current_user.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admins can list all companies"
        )
    
    result = await db.execute(
        select(Company).where(
            Company.deleted_at.is_(None)
        ).offset(skip).limit(limit)
    )
    companies = result.scalars().all()
    
    return companies


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: UUID,
    current_user: CurrentUser = Depends(get_current_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get company by ID.
    Includes admin user status for SuperAdmin visibility.
    """
    check_company_access(current_user, company_id)
    
    result = await db.execute(
        select(Company).where(
            Company.id == company_id,
            Company.deleted_at.is_(None)
        )
    )
    company = result.scalar_one_or_none()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Get admin user for this company (if caller is SuperAdmin)
    admin_status = None
    admin_email = None
    
    if current_user.has_any_role(UserRole.SUPER_ADMIN):
        admin_result = await db.execute(
            select(User, UserRoleAssignment).join(
                UserRoleAssignment, User.id == UserRoleAssignment.user_id
            ).where(
                User.company_id == company_id,
                UserRoleAssignment.role == UserRole.ADMIN,
                User.deleted_at.is_(None)
            ).limit(1)
        )
        admin_row = admin_result.first()
        if admin_row:
            admin_user = admin_row[0]
            admin_status = admin_user.status.value if admin_user.status else None
            admin_email = admin_user.email
    
    # Build response with admin info
    return CompanyResponse(
        id=company.id,
        name=company.name,
        domain=company.domain,
        website=company.website,
        linkedin_url=company.linkedin_url,
        diversity_policy=company.diversity_policy,
        subscription_tier=company.subscription_tier,
        api_credits_limit=company.api_credits_limit,
        logo_url=company.logo_url,
        total_storage_used=company.total_storage_used,
        api_credits_used=company.api_credits_used,
        next_invoice_date=company.next_invoice_date,
        is_active=company.is_active,
        created_at=company.created_at,
        updated_at=company.updated_at,
        admin_status=admin_status,
        admin_email=admin_email
    )


@router.patch("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: UUID,
    company_update: CompanyUpdate,
    current_user: CurrentUser = Depends(get_current_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update company information (ADMIN or SUPER_ADMIN).
    """
    if not current_user.has_any_role(UserRole.SUPER_ADMIN, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update company information"
        )
    
    check_company_access(current_user, company_id)
    
    # Get company
    result = await db.execute(
        select(Company).where(Company.id == company_id)
    )
    company = result.scalar_one_or_none()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Update fields
    update_data = company_update.model_dump(exclude_unset=True)
    
    # Convert HttpUrl objects to strings
    if 'website' in update_data and update_data['website']:
        update_data['website'] = str(update_data['website'])
    if 'linkedin_url' in update_data and update_data['linkedin_url']:
        update_data['linkedin_url'] = str(update_data['linkedin_url'])
    
    await db.execute(
        update(Company).where(Company.id == company_id).values(**update_data)
    )
    await db.commit()
    await db.refresh(company)
    
    return company


@router.get("/{company_id}/dashboard", response_model=CompanyDashboardMetrics)
async def get_company_dashboard(
    company_id: UUID,
    current_user: CurrentUser = Depends(get_current_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get company dashboard metrics.
    Shows total employees, storage used, API credits, etc.
    """
    if not current_user.has_any_role(UserRole.SUPER_ADMIN, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view dashboard"
        )
    
    check_company_access(current_user, company_id)
    
    # Get company info
    company_result = await db.execute(
        select(Company).where(
            Company.id == company_id,
            Company.deleted_at.is_(None)
        )
    )
    company = company_result.scalar_one_or_none()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Count employees
    employee_count = await db.scalar(
        select(func.count(User.id)).where(
            User.company_id == company_id,
            User.deleted_at.is_(None)
        )
    )
    
    # Count jobs
    job_count = await db.scalar(
        select(func.count(Job.id)).where(
            Job.company_id == company_id,
            Job.deleted_at.is_(None)
        )
    )
    
    # Count applications for company jobs
    application_count = await db.scalar(
        select(func.count(Application.id)).join(
            Job, Application.job_id == Job.id
        ).where(
            Job.company_id == company_id,
            Job.deleted_at.is_(None)
        )
    )
    
    return CompanyDashboardMetrics(
        company_id=company.id,
        company_name=company.name,
        total_employees=employee_count or 0,
        total_storage_used=company.total_storage_used or 0,
        api_credits_used=company.api_credits_used or 0,
        api_credits_limit=company.api_credits_limit or 0,
        next_invoice_date=company.next_invoice_date,
        total_jobs=job_count or 0,
        total_applications=application_count or 0
    )


@router.post("/{company_id}/users", response_model=UserListItem, status_code=status.HTTP_201_CREATED)
async def create_user(
    request: Request,
    company_id: UUID,
    user_data: UserCreate,
    current_user: CurrentUser = Depends(get_current_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Add a new user to company (ADMIN only).
    Creates user and sends invitation email.
    """
    if not current_user.has_any_role(UserRole.SUPER_ADMIN, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can add users"
        )
    
    check_company_access(current_user, company_id)
    
    # Validate role
    if user_data.role not in ["ADMIN", "HR"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only create ADMIN or HR users"
        )
    
    # Check if email already exists
    existing = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )
    
    # Get company
    company_result = await db.execute(
        select(Company).where(Company.id == company_id)
    )
    company = company_result.scalar_one_or_none()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Create user
    user = User(
        company_id=company_id,
        email=user_data.email,
        full_name=user_data.full_name,
        is_active=True,
        is_password_set=False,
        status=UserStatus.INVITED
    )
    
    db.add(user)
    await db.flush()
    
    # Assign role
    role_assignment = UserRoleAssignment(
        user_id=user.id,
        role=UserRole[user_data.role],
        assigned_by=current_user.id
    )
    db.add(role_assignment)
    
    # Generate invitation token
    invitation_token = create_email_verification_token(user.email)
    user.email_verification_token = invitation_token
    user.email_verification_expires = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.commit()
    await db.refresh(user)
    
    # Send invitation email
    activation_link = f"{settings.EMAIL_VERIFICATION_URL}?token={invitation_token}"
    await email_service.send_templated_email(
        db=db,
        to_email=user.email,
        template_name="welcome_email",
        company_id=company.id,  # enables company-specific branding
        context={
            "user_name": user.full_name,
            "activation_link": activation_link,
        }
    )
    
    # Log user creation
    ip_address = request.client.host if request.client else None
    await audit_service.log_user_creation(
        db=db,
        created_by_id=current_user.id,
        company_id=company_id,
        user_id=user.id,
        user_email=user.email,
        role=user_data.role,
        ip_address=ip_address
    )
    
    return UserListItem(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        roles=[user_data.role],
        is_email_verified=False,
        is_active=True,
        is_password_set=False,
        status=UserStatus.INVITED.value,
        last_login_at=None,
        created_at=user.created_at
    )


@router.get("/{company_id}/users", response_model=PaginatedUserResponse)
async def list_company_users(
    company_id: UUID,
    current_user: CurrentUser = Depends(get_current_verified_user),
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100)
):
    """
    List all users in a company with pagination.
    """
    if not current_user.has_any_role(UserRole.SUPER_ADMIN, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can list users"
        )
    
    check_company_access(current_user, company_id)
    
    # Count total users
    count_query = select(func.count(User.id)).where(
        User.company_id == company_id,
        User.deleted_at.is_(None)
    )
    total = await db.scalar(count_query)
    
    # Get users with pagination
    offset = (page - 1) * page_size
    users_query = select(User).where(
        User.company_id == company_id,
        User.deleted_at.is_(None)
    ).offset(offset).limit(page_size).order_by(User.created_at.desc())
    
    result = await db.execute(users_query)
    users = result.scalars().all()
    
    # Get roles for each user
    user_items = []
    for user in users:
        roles_query = select(UserRoleAssignment.role).where(
            UserRoleAssignment.user_id == user.id
        )
        roles_result = await db.execute(roles_query)
        roles = [role.value for role, in roles_result.all()]
        
        user_items.append(UserListItem(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            phone=user.phone,
            roles=roles,
            is_email_verified=user.is_email_verified,
            is_active=user.is_active,
            is_password_set=user.is_password_set,
            status=user.status.value if user.status else None,
            last_login_at=user.last_login_at,
            created_at=user.created_at
        ))
    
    return PaginatedUserResponse(
        items=user_items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=ceil(total / page_size) if total > 0 else 0
    )


@router.patch("/{company_id}/users/{user_id}", response_model=UserListItem)
async def update_user(
    company_id: UUID,
    user_id: UUID,
    user_update: UserUpdate,
    current_user: CurrentUser = Depends(get_current_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update user information (ADMIN only).
    """
    if not current_user.has_any_role(UserRole.SUPER_ADMIN, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update users"
        )
    
    check_company_access(current_user, company_id)
    
    # Get user
    result = await db.execute(
        select(User).where(
            User.id == user_id,
            User.company_id == company_id,
            User.deleted_at.is_(None)
        )
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user
    update_data = user_update.model_dump(exclude_unset=True)
    await db.execute(
        update(User).where(User.id == user_id).values(**update_data)
    )
    await db.commit()
    await db.refresh(user)
    
    # Get roles
    roles_query = select(UserRoleAssignment.role).where(
        UserRoleAssignment.user_id == user.id
    )
    roles_result = await db.execute(roles_query)
    roles = [role.value for role, in roles_result.all()]
    
    return UserListItem(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        roles=roles,
        is_email_verified=user.is_email_verified,
        is_active=user.is_active,
        is_password_set=user.is_password_set,
        status=user.status.value if user.status else None,
        last_login_at=user.last_login_at,
        created_at=user.created_at
    )


# ============================================================================
# DELETE COMPANY (SUPER_ADMIN ONLY)
# ============================================================================

@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(
    request: Request,
    company_id: UUID,
    current_user: CurrentUser = Depends(get_current_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a company and all associated users (SUPER_ADMIN only).
    
    This is a soft delete - sets deleted_at timestamp.
    All users in the company will also be soft deleted.
    """
    if not current_user.has_any_role(UserRole.SUPER_ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admins can delete companies"
        )
    
    # Get company
    result = await db.execute(
        select(Company).where(
            Company.id == company_id,
            Company.deleted_at.is_(None)
        )
    )
    company = result.scalar_one_or_none()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    now = datetime.now(timezone.utc)
    
    # Soft delete all users in the company
    await db.execute(
        update(User)
        .where(User.company_id == company_id)
        .values(deleted_at=now, status=UserStatus.DELETED, is_active=False)
    )
    
    # Soft delete the company
    await db.execute(
        update(Company)
        .where(Company.id == company_id)
        .values(deleted_at=now, is_active=False)
    )
    
    await db.commit()
    
    # Log deletion
    ip_address = request.client.host if request.client else None
    await audit_service.log_action(
        db=db,
        action=AuditAction.DELETE,
        company_id=company_id,
        user_id=current_user.id,
        resource_type="company",
        resource_id=company_id,
        metadata={"action_type": "company_deletion", "company_name": company.name},
        ip_address=ip_address
    )
    
    return None


# ============================================================================
# DELETE USER (ADMIN, SUPER_ADMIN)
# ============================================================================

@router.delete("/{company_id}/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    request: Request,
    company_id: UUID,
    user_id: UUID,
    current_user: CurrentUser = Depends(get_current_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Soft delete a user (ADMIN, SUPER_ADMIN).
    
    Sets deleted_at timestamp and status to DELETED.
    User will not be able to login after deletion.
    """
    if not current_user.has_any_role(UserRole.SUPER_ADMIN, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete users"
        )
    
    check_company_access(current_user, company_id)
    
    # Prevent self-deletion
    if str(current_user.id) == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Get user
    result = await db.execute(
        select(User).where(
            User.id == user_id,
            User.company_id == company_id,
            User.deleted_at.is_(None)
        )
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    now = datetime.now(timezone.utc)
    
    # Soft delete the user
    await db.execute(
        update(User)
        .where(User.id == user_id)
        .values(deleted_at=now, status=UserStatus.DELETED, is_active=False)
    )
    
    await db.commit()
    
    # Log deletion
    ip_address = request.client.host if request.client else None
    await audit_service.log_action(
        db=db,
        action=AuditAction.DELETE,
        company_id=company_id,
        user_id=current_user.id,
        resource_type="user",
        resource_id=user_id,
        metadata={"action_type": "user_deletion", "user_email": user.email},
        ip_address=ip_address
    )
    
    return None


# ============================================================================
# REACTIVATE USER (SUPER_ADMIN ONLY)
# ============================================================================

@router.post("/{company_id}/users/{user_id}/reactivate")
async def reactivate_user(
    request: Request,
    company_id: UUID,
    user_id: UUID,
    current_user: CurrentUser = Depends(get_current_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Reactivate a deleted user (SUPER_ADMIN only).
    
    Clears deleted_at timestamp and sets status to ACTIVE.
    """
    if not current_user.has_any_role(UserRole.SUPER_ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admins can reactivate users"
        )
    
    # Get deleted user
    result = await db.execute(
        select(User).where(
            User.id == user_id,
            User.company_id == company_id,
            User.deleted_at.isnot(None)
        )
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deleted user not found"
        )
    
    # Check if company is also deleted
    company_result = await db.execute(
        select(Company).where(Company.id == company_id)
    )
    company = company_result.scalar_one_or_none()
    
    if company and company.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot reactivate user from a deleted company"
        )
    
    # Reactivate the user
    await db.execute(
        update(User)
        .where(User.id == user_id)
        .values(deleted_at=None, status=UserStatus.ACTIVE, is_active=True)
    )
    
    await db.commit()
    
    # Log reactivation
    ip_address = request.client.host if request.client else None
    await audit_service.log_action(
        db=db,
        action=AuditAction.UPDATE,
        company_id=company_id,
        user_id=current_user.id,
        resource_type="user",
        resource_id=user_id,
        metadata={"action_type": "user_reactivation", "user_email": user.email},
        ip_address=ip_address
    )
    
    return {
        "success": True,
        "message": f"User {user.email} has been reactivated",
        "user_id": user_id
    }

