"""
Role-Based Access Control (RBAC) decorators and utilities.
Enforces role-based authorization at the route level.
"""
from functools import wraps
from typing import Callable, List, Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import decode_token
from db.session import get_db
from models import User, UserRoleAssignment, UserRole


security = HTTPBearer()


class CurrentUser:
    """Current authenticated user with roles."""
    
    def __init__(
        self,
        id: UUID,
        email: str,
        full_name: str,
        company_id: Optional[UUID],
        roles: List[UserRole],
        is_active: bool,
        is_email_verified: bool
    ):
        self.id = id
        self.email = email
        self.full_name = full_name
        self.company_id = company_id
        self.roles = roles
        self.is_active = is_active
        self.is_email_verified = is_email_verified
    
    def has_role(self, role: UserRole) -> bool:
        """Check if user has a specific role."""
        return role in self.roles
    
    def has_any_role(self, *roles: UserRole) -> bool:
        """Check if user has any of the specified roles."""
        return any(role in self.roles for role in roles)
    
    def has_all_roles(self, *roles: UserRole) -> bool:
        """Check if user has all of the specified roles."""
        return all(role in self.roles for role in roles)
    
    @property
    def is_super_admin(self) -> bool:
        """Check if user is a super admin."""
        return UserRole.SUPER_ADMIN in self.roles
    
    @property
    def is_admin(self) -> bool:
        """Check if user is an admin."""
        return UserRole.ADMIN in self.roles
    
    @property
    def is_hr(self) -> bool:
        """Check if user is HR."""
        return UserRole.HR in self.roles
    
    @property
    def is_candidate(self) -> bool:
        """Check if user is a candidate."""
        return UserRole.CANDIDATE in self.roles


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> CurrentUser:
    """
    Dependency to get current authenticated user from JWT token.
    Verifies token, loads user from database, and returns CurrentUser object.
    
    Raises:
        HTTPException: If token is invalid, user not found, or user is inactive.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode and verify token
        payload = decode_token(credentials.credentials)
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if user_id is None or token_type != "access":
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # Load user from database
    query = select(User).where(User.id == UUID(user_id), User.deleted_at.is_(None))
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    # Load user roles
    roles_query = select(UserRoleAssignment.role).where(UserRoleAssignment.user_id == user.id)
    roles_result = await db.execute(roles_query)
    roles = [role for role, in roles_result.all()]
    
    return CurrentUser(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        company_id=user.company_id,
        roles=roles,
        is_active=user.is_active,
        is_email_verified=user.is_email_verified
    )


async def get_current_verified_user(
    current_user: CurrentUser = Depends(get_current_user)
) -> CurrentUser:
    """
    Dependency to ensure user has verified their email.
    
    Raises:
        HTTPException: If user email is not verified.
    """
    if not current_user.is_email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please verify your email to continue."
        )
    return current_user


def require_role(*allowed_roles: UserRole):
    """
    Decorator to require specific role(s) for a route.
    User must have at least one of the specified roles.
    
    Usage:
        @router.get("/admin-only")
        @require_role(UserRole.SUPER_ADMIN, UserRole.ADMIN)
        async def admin_endpoint(current_user: CurrentUser = Depends(get_current_verified_user)):
            pass
    
    Args:
        allowed_roles: One or more UserRole values
        
    Raises:
        HTTPException: If user doesn't have required role
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, current_user: CurrentUser = Depends(get_current_verified_user), **kwargs):
            if not current_user.has_any_role(*allowed_roles):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied. Required role(s): {', '.join(r.value for r in allowed_roles)}"
                )
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator


def require_super_admin():
    """
    Decorator to require SUPER_ADMIN role.
    
    Usage:
        @router.post("/companies")
        @require_super_admin()
        async def create_company(current_user: CurrentUser = Depends(get_current_verified_user)):
            pass
    """
    return require_role(UserRole.SUPER_ADMIN)


def require_admin():
    """
    Decorator to require ADMIN or SUPER_ADMIN role.
    
    Usage:
        @router.post("/users")
        @require_admin()
        async def create_user(current_user: CurrentUser = Depends(get_current_verified_user)):
            pass
    """
    return require_role(UserRole.SUPER_ADMIN, UserRole.ADMIN)


def require_hr():
    """
    Decorator to require HR, ADMIN, or SUPER_ADMIN role.
    
    Usage:
        @router.post("/jobs")
        @require_hr()
        async def create_job(current_user: CurrentUser = Depends(get_current_verified_user)):
            pass
    """
    return require_role(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR)


def check_company_access(user: CurrentUser, company_id) -> None:
    """
    Verify that a user has access to a specific company.
    Super admins have access to all companies.
    Other users can only access their own company.
    
    Args:
        user: Current authenticated user
        company_id: Company ID to check access for (can be str or UUID)
        
    Raises:
        HTTPException: If user doesn't have access to the company
    """
    if user.is_super_admin:
        return
    
    # Convert company_id to UUID if it's a string for proper comparison
    if isinstance(company_id, str):
        company_id = UUID(company_id)
    
    if user.company_id != company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You can only access your own company."
        )



def check_resource_ownership(
    user: CurrentUser,
    resource_company_id: Optional[UUID] = None,
    resource_user_id: Optional[UUID] = None
) -> None:
    """
    Verify that a user can access a specific resource.
    
    Args:
        user: Current authenticated user
        resource_company_id: Company ID of the resource
        resource_user_id: User ID of the resource owner
        
    Raises:
        HTTPException: If user doesn't have access to the resource
    """
    # Super admins can access everything
    if user.is_super_admin:
        return
    
    # Check company access if resource has company_id
    if resource_company_id is not None:
        check_company_access(user, resource_company_id)
    
    # Check user ownership if resource has user_id and user is not admin/HR
    if resource_user_id is not None and not user.has_any_role(UserRole.ADMIN, UserRole.HR):
        if user.id != resource_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You can only access your own resources."
            )
