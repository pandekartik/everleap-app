"""
LinkedIn API endpoints for Unipile integration.
Handles account management, OAuth, and job posting.
"""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.rbac import CurrentUser, get_current_user, require_role
from db.session import get_db
from models import UserRole
from services.unipile import unipile_service
from schemas.linkedin import (
    LinkedInConnectResponse,
    LinkedInStatusResponse,
    LinkedInAccountsListResponse,
    LinkedInOrganizationsResponse,
    DeleteAccountResponse
)


router = APIRouter(prefix="/linkedin", tags=["LinkedIn Integration"])


# ============================================================================
# ACCOUNT CONNECTION
# ============================================================================

@router.post("/connect", response_model=LinkedInConnectResponse)
@require_role([UserRole.SUPER_ADMIN, UserRole.ADMIN])
async def connect_linkedin_account(
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Step 1: Initiate LinkedIn account connection via Unipile hosted page.
    
    Returns a URL to redirect the admin to for OAuth authorization.
    After authorization, user will be redirected back to frontend.
    
    Permissions: SUPER_ADMIN, ADMIN only
    """
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must be associated with a company"
        )
    
    # Create hosted account link
    result = await unipile_service.create_hosted_account_link(
        provider="LINKEDIN",
        success_redirect_url=f"{settings.FRONTEND_URL}/settings/integrations?linkedin=success&company_id={current_user.company_id}&user_id={current_user.id}",
        failure_redirect_url=f"{settings.FRONTEND_URL}/settings/integrations?linkedin=error"
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to create connection link")
        )
    
    return LinkedInConnectResponse(
        authorization_url=result["url"],
        expires_at=result.get("expires_at"),
        message="Please complete authorization in the opened window"
    )


@router.post("/webhook/connection")
async def handle_connection_webhook(
    request: Request,
    account_id: str = Query(..., description="Unipile account ID"),
    company_id: UUID = Query(..., description="Company ID"),
    user_id: UUID = Query(..., description="User ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Webhook endpoint called by Unipile after successful OAuth.
    Can also be called manually from frontend after redirect.
    
    This stores the account connection in the database.
    """
    result = await unipile_service.handle_webhook_connection(
        db=db,
        account_id=account_id,
        company_id=company_id,
        user_id=user_id
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to connect account")
        )
    
    return {
        "success": True,
        "account_id": result["account_id"],
        "profile": result["profile"],
        "message": "LinkedIn account connected successfully"
    }


# ============================================================================
# ACCOUNT STATUS & MANAGEMENT
# ============================================================================

@router.get("/status", response_model=LinkedInStatusResponse)
@require_role([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR])
async def get_linkedin_status(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get LinkedIn connection status for current company.
    
    Returns:
    - Whether LinkedIn is connected
    - Account profile information
    - Available company pages (organizations)
    - Expiration date
    """
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must be associated with a company"
        )
    
    status_result = await unipile_service.get_linkedin_status(
        db=db,
        company_id=current_user.company_id
    )
    
    return LinkedInStatusResponse(**status_result)


@router.get("/organizations", response_model=LinkedInOrganizationsResponse)
@require_role([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR])
async def get_linkedin_organizations(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get LinkedIn organizations (company pages) that user can post to.
    
    This returns all company pages the connected user has admin access to.
    Use organization_id when posting jobs to post on company page.
    """
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must be associated with a company"
        )
    
    # Get account ID from database
    from sqlalchemy import select
    from models import OAuthToken
    
    result = await db.execute(
        select(OAuthToken).where(
            OAuthToken.company_id == current_user.company_id,
            OAuthToken.provider == "linkedin"
        )
    )
    token = result.scalar_one_or_none()
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="LinkedIn not connected"
        )
    
    account_id = token.access_token
    
    # Get organizations from Unipile
    orgs_result = await unipile_service.get_linkedin_organizations(account_id)
    
    if not orgs_result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=orgs_result.get("error", "Failed to get organizations")
        )
    
    return LinkedInOrganizationsResponse(
        organizations=orgs_result["organizations"],
        count=orgs_result["count"]
    )


# ============================================================================
# ACCOUNT DELETION
# ============================================================================

@router.delete("/disconnect", response_model=DeleteAccountResponse)
@require_role([UserRole.SUPER_ADMIN, UserRole.ADMIN])
async def disconnect_linkedin_account(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Disconnect LinkedIn account for current company.
    
    This:
    1. Deletes account from Unipile
    2. Removes token from database
    
    Permissions: SUPER_ADMIN, ADMIN only
    """
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must be associated with a company"
        )
    
    # Get account ID
    from sqlalchemy import select
    from models import OAuthToken
    
    result = await db.execute(
        select(OAuthToken).where(
            OAuthToken.company_id == current_user.company_id,
            OAuthToken.provider == "linkedin"
        )
    )
    token = result.scalar_one_or_none()
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="LinkedIn not connected"
        )
    
    account_id = token.access_token
    
    # Delete from Unipile
    delete_result = await unipile_service.delete_account(account_id)
    
    if not delete_result.get("success"):
        # Even if Unipile delete fails, remove from our database
        await db.delete(token)
        await db.commit()
        
        return DeleteAccountResponse(
            success=True,
            message="Account removed from database (Unipile deletion may have failed)",
            warning=delete_result.get("error")
        )
    
    # Delete from database
    await db.delete(token)
    await db.commit()
    
    return DeleteAccountResponse(
        success=True,
        message="LinkedIn account disconnected successfully"
    )


# ============================================================================
# SUPER ADMIN: MANAGE ALL ACCOUNTS
# ============================================================================

@router.get("/admin/accounts", response_model=LinkedInAccountsListResponse)
@require_role([UserRole.SUPER_ADMIN])
async def list_all_linkedin_accounts(
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    [SUPER ADMIN ONLY] List all LinkedIn accounts in Unipile.
    
    This shows ALL connected accounts across ALL companies.
    Use for monitoring and troubleshooting.
    """
    result = await unipile_service.list_accounts(providers=["LINKEDIN"])
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to list accounts")
        )
    
    return LinkedInAccountsListResponse(
        accounts=result["accounts"],
        count=result["count"]
    )


@router.delete("/admin/accounts/{account_id}", response_model=DeleteAccountResponse)
@require_role([UserRole.SUPER_ADMIN])
async def delete_linkedin_account_by_id(
    account_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    [SUPER ADMIN ONLY] Delete any LinkedIn account by Unipile account ID.
    
    This:
    1. Deletes account from Unipile
    2. Removes token from database (if exists)
    
    Use for:
    - Removing accounts of deleted companies
    - Cleaning up orphaned accounts
    - Emergency disconnection
    """
    # Delete from Unipile
    delete_result = await unipile_service.delete_account(account_id)
    
    if not delete_result.get("success"):
        # Log warning but continue to delete from database
        print(f"[WARNING] Failed to delete account {account_id} from Unipile: {delete_result.get('error')}")
    
    # Delete from database (if exists)
    from sqlalchemy import select, delete as sql_delete
    from models import OAuthToken
    
    result = await db.execute(
        select(OAuthToken).where(
            OAuthToken.access_token == account_id,
            OAuthToken.provider == "linkedin"
        )
    )
    token = result.scalar_one_or_none()
    
    if token:
        await db.delete(token)
        await db.commit()
        
        return DeleteAccountResponse(
            success=True,
            message=f"Account {account_id} deleted from Unipile and database"
        )
    
    return DeleteAccountResponse(
        success=True,
        message=f"Account {account_id} deleted from Unipile (not found in database)",
        warning="Account was not found in database"
    )


@router.get("/admin/accounts/{account_id}")
@require_role([UserRole.SUPER_ADMIN])
async def get_account_details(
    account_id: str,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    [SUPER ADMIN ONLY] Get details of any account.
    """
    result = await unipile_service.get_account(account_id)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("error", "Account not found")
        )
    
    return result["account"]