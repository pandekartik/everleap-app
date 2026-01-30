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
@require_role(UserRole.SUPER_ADMIN, UserRole.ADMIN)
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
    # notify_url: Backend receives account_id from Unipile (POST request)
    # success_redirect_url: User is redirected here after successful auth
    result = await unipile_service.create_hosted_account_link(
        provider="LINKEDIN",
        success_redirect_url=f"{settings.BACKEND_URL}/api/v1/linkedin/callback?company_id={current_user.company_id}&user_id={current_user.id}",
        failure_redirect_url="https://www.everleap.in/dashboard?linkedin=error"
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


@router.api_route("/callback", methods=["GET", "POST"])
async def linkedin_oauth_callback(
    request: Request,
    company_id: UUID = Query(..., description="Company ID"),
    user_id: UUID = Query(..., description="User ID"),
    account_id: Optional[str] = Query(None, description="Unipile account ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Callback endpoint that Unipile calls after successful OAuth.
    
    Accepts both GET and POST because:
    - Browser redirects use GET
    - Unipile webhook/notify uses POST
    
    This endpoint:
    1. Receives account_id from Unipile (in query params or POST body)
    2. Saves the account connection to database
    3. Redirects user to frontend dashboard with success/error status
    """
    # Try to get account_id from POST body if not in query params
    if not account_id and request.method == "POST":
        try:
            body = await request.json()
            account_id = body.get("account_id") or body.get("id")
        except:
            pass
    
    # If no account_id, redirect with error
    if not account_id:
        return RedirectResponse(
            url="https://www.everleap.in/dashboard?linkedin=error&reason=no_account_id",
            status_code=302
        )
    
    # Save the account connection
    result = await unipile_service.handle_webhook_connection(
        db=db,
        account_id=account_id,
        company_id=company_id,
        user_id=user_id
    )
    
    if not result.get("success"):
        # Include account_id in error redirect for debugging
        return RedirectResponse(
            url=f"https://www.everleap.in/dashboard?linkedin=error&account_id={account_id}&reason={result.get('error', 'connection_failed')}",
            status_code=302
        )
    
    # Success - redirect to dashboard
    return RedirectResponse(
        url="https://www.everleap.in/dashboard?linkedin=success",
        status_code=302
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
@require_role(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR)
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


@router.get("/company-profile")
@require_role(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR)
async def get_linkedin_company_profile(
    company_identifier: Optional[str] = Query(None, description="LinkedIn company vanity name or ID. If not provided, uses stored organization."),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get LinkedIn company profile.
    
    If company_identifier is provided, looks up that company.
    If not provided, returns the stored organization profile.
    
    Use the company vanity name from the LinkedIn URL:
    - linkedin.com/company/everleap-in → identifier = 'everleap-in'
    
    Permissions: SUPER_ADMIN, ADMIN, HR
    """
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must be associated with a company"
        )
    
    # Get account ID and company info from database
    from sqlalchemy import select
    from models import OAuthToken, Company
    
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
    
    # If no identifier provided, use stored organization
    if not company_identifier:
        company_result = await db.execute(
            select(Company).where(Company.id == current_user.company_id)
        )
        company = company_result.scalar_one_or_none()
        
        if not company or not company.linkedin_organization_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No LinkedIn organization configured. Admin must set organization first."
            )
        
        # Use stored organization_id to fetch full profile from LinkedIn
        company_identifier = company.linkedin_organization_id
    
    # Get company profile from Unipile
    profile_result = await unipile_service.get_linkedin_company_profile(
        account_id=account_id,
        company_identifier=company_identifier
    )
    
    if not profile_result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=profile_result.get("error", "Failed to get company profile")
        )
    
    return {
        "success": True,
        "organization_id": profile_result.get("organization_id"),
        "name": profile_result.get("name"),
        "vanity_name": profile_result.get("vanity_name"),
        "logo_url": profile_result.get("logo_url"),
        "follower_count": profile_result.get("follower_count"),
        "description": profile_result.get("description"),
        "company_data": profile_result.get("company")
    }


@router.get("/search-companies")
@require_role(UserRole.SUPER_ADMIN, UserRole.ADMIN)
async def search_linkedin_companies(
    query: str = Query(..., description="Company name to search for"),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Search for LinkedIn companies by name.
    
    Use this to find your company and get its identifier for the company-profile endpoint.
    
    Permissions: SUPER_ADMIN, ADMIN only
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
    
    # Search companies from Unipile
    search_result = await unipile_service.search_linkedin_companies(
        account_id=account_id,
        company_name=query
    )
    
    if not search_result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=search_result.get("error", "Failed to search companies")
        )
    
    return {
        "success": True,
        "companies": search_result.get("companies", []),
        "count": search_result.get("count", 0)
    }


# ============================================================================
# ORGANIZATION SELECTION (ADMIN CONFIGURES COMPANY PAGE FOR JOB POSTING)
# ============================================================================

@router.post("/set-organization")
@require_role(UserRole.ADMIN)
async def set_linkedin_organization(
    organization_id: str,
    organization_name: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Set the LinkedIn organization (company page) to use for job posting.
    
    Admin must call this after connecting LinkedIn to select which
    company page jobs should be posted to.
    
    - organization_id: The LinkedIn organization URN (from /linkedin/organizations)
    - organization_name: Display name of the organization
    
    Permissions: SUPER_ADMIN, ADMIN only
    """
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must be associated with a company"
        )
    
    from sqlalchemy import select, update
    from models import Company
    
    # Update company with selected organization
    await db.execute(
        update(Company)
        .where(Company.id == current_user.company_id)
        .values(
            linkedin_organization_id=organization_id,
            linkedin_organization_name=organization_name
        )
    )
    await db.commit()
    
    return {
        "success": True,
        "message": f"LinkedIn organization set to: {organization_name}",
        "organization_id": organization_id,
        "organization_name": organization_name
    }


@router.get("/current-organization")
@require_role(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR)
async def get_current_linkedin_organization(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the currently configured LinkedIn organization for job posting.
    
    Returns the company page that Admin has selected for posting jobs.
    HR can view this to know where jobs will be posted.
    """
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User must be associated with a company"
        )
    
    from sqlalchemy import select
    from models import Company
    
    result = await db.execute(
        select(Company).where(Company.id == current_user.company_id)
    )
    company = result.scalar_one_or_none()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    return {
        "organization_id": company.linkedin_organization_id,
        "organization_name": company.linkedin_organization_name,
        "configured": company.linkedin_organization_id is not None
    }


# ============================================================================
# ACCOUNT DELETION
# ============================================================================

@router.delete("/disconnect", response_model=DeleteAccountResponse)
@require_role(UserRole.SUPER_ADMIN, UserRole.ADMIN)
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
@require_role(UserRole.SUPER_ADMIN)
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
@require_role(UserRole.SUPER_ADMIN)
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
@require_role(UserRole.SUPER_ADMIN)
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