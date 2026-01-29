"""
Complete Unipile API integration for LinkedIn.
Based on official Unipile documentation with proper draft-publish flow.

API Base URL: https://api27.unipile.com:15749/api/v1/
"""
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from uuid import UUID

import httpx
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from models import OAuthToken, Job


class UnipileService:
    """
    Complete Unipile service for LinkedIn integration.
    
    Features:
    - Account management (add, list, delete)
    - OAuth flow
    - Job posting with proper draft → publish flow
    - Organization (company page) management
    - Job editing and closing
    """
    
    def __init__(self):
        """Initialize Unipile service."""
        self.api_key = settings.UNIPILE_API_KEY
        self.api_url = settings.UNIPILE_API_URL
        self.headers = {
            "X-API-KEY": self.api_key,
            "accept": "application/json",
            "content-type": "application/json"
        }
    
    # ========================================================================
    # ACCOUNT MANAGEMENT
    # ========================================================================
    
    async def create_hosted_account_link(
        self,
        provider: str = "LINKEDIN",
        success_redirect_url: Optional[str] = None,
        failure_redirect_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a hosted account link for LinkedIn OAuth.
        
        API: POST /hosted/accounts/link
        Docs: https://developer.unipile.com/reference/hostedaccountcontroller_createhostedaccountlink
        """
        try:
            payload = {
                "provider": provider,
                "success_redirect_url": success_redirect_url or f"{settings.FRONTEND_URL}/settings/integrations?linkedin=success",
                "failure_redirect_url": failure_redirect_url or f"{settings.FRONTEND_URL}/settings/integrations?linkedin=error"
            }
            
            async with httpx.AsyncClient(verify=False) as client:
                response = await client.post(
                    f"{self.api_url}/hosted/accounts/link",
                    headers=self.headers,
                    json=payload,
                    timeout=30.0
                )
                
                response.raise_for_status()
                data = response.json()
                
                return {
                    "success": True,
                    "url": data.get("url"),
                    "expires_at": data.get("expiresAt"),
                    "provider": provider
                }
                
        except httpx.HTTPError as e:
            error_detail = e.response.text if hasattr(e.response, 'text') else str(e)
            return {
                "success": False,
                "error": f"Failed to create hosted link: {error_detail}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Unexpected error: {str(e)}"
            }
    
    async def list_accounts(
        self,
        providers: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        List all connected accounts in Unipile.
        
        API: GET /accounts
        Docs: https://developer.unipile.com/reference/accountcontroller_getaccounts
        """
        try:
            params = {}
            if providers:
                params["providers"] = ",".join(providers)
            
            async with httpx.AsyncClient(verify=False) as client:
                response = await client.get(
                    f"{self.api_url}/accounts",
                    headers=self.headers,
                    params=params,
                    timeout=30.0
                )
                
                response.raise_for_status()
                data = response.json()
                
                accounts = data if isinstance(data, list) else []
                
                return {
                    "success": True,
                    "accounts": accounts,
                    "count": len(accounts)
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to list accounts: {str(e)}",
                "accounts": []
            }
    
    async def get_account(
        self,
        account_id: str
    ) -> Dict[str, Any]:
        """
        Get details of a specific account.
        
        API: GET /accounts/{account_id}
        Docs: https://developer.unipile.com/reference/accountcontroller_getaccount
        """
        try:
            async with httpx.AsyncClient(verify=False) as client:
                response = await client.get(
                    f"{self.api_url}/accounts/{account_id}",
                    headers=self.headers,
                    timeout=30.0
                )
                
                response.raise_for_status()
                data = response.json()
                
                return {
                    "success": True,
                    "account": data
                }
                
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return {
                    "success": False,
                    "error": "Account not found"
                }
            return {
                "success": False,
                "error": f"Failed to get account: {e.response.text}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to get account: {str(e)}"
            }
    
    async def delete_account(
        self,
        account_id: str
    ) -> Dict[str, Any]:
        """
        Delete account from Unipile.
        
        API: DELETE /accounts/{account_id}
        Docs: https://developer.unipile.com/reference/accountcontroller_deleteaccount
        """
        try:
            async with httpx.AsyncClient(verify=False) as client:
                response = await client.delete(
                    f"{self.api_url}/accounts/{account_id}",
                    headers=self.headers,
                    timeout=30.0
                )
                
                response.raise_for_status()
                
                return {
                    "success": True,
                    "message": "Account deleted from Unipile"
                }
                
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return {
                    "success": False,
                    "error": "Account not found"
                }
            return {
                "success": False,
                "error": f"Failed to delete account: {e.response.text}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to delete account: {str(e)}"
            }
    
    # ========================================================================
    # OAUTH & TOKEN MANAGEMENT
    # ========================================================================
    
    async def handle_webhook_connection(
        self,
        db: AsyncSession,
        account_id: str,
        company_id: UUID,
        user_id: UUID
    ) -> Dict[str, Any]:
        """
        Handle account connection from Unipile webhook.
        
        IMPORTANT: Unipile uses persistent account_id (not traditional OAuth).
        - account_id = Permanent credential for API calls
        - No expiration or refresh needed
        - Unipile manages LinkedIn token refresh internally
        """
        try:
            # Get account details from Unipile
            account_result = await self.get_account(account_id)
            
            if not account_result.get("success"):
                return account_result
            
            account = account_result["account"]
            
            # Store in database
            result = await db.execute(
                select(OAuthToken).where(
                    OAuthToken.company_id == company_id,
                    OAuthToken.provider == "linkedin"
                )
            )
            existing_token = result.scalar_one_or_none()
            
            # Set far-future expiry (Unipile accounts don't expire)
            expires_at = datetime.utcnow() + timedelta(days=3650)  # 10 years
            
            if existing_token:
                # Update existing
                await db.execute(
                    update(OAuthToken)
                    .where(OAuthToken.id == existing_token.id)
                    .values(
                        access_token=account_id,
                        refresh_token=account_id,
                        token_type="unipile_account",
                        expires_at=expires_at,
                        scope=account.get("username", ""),
                        updated_at=datetime.utcnow()
                    )
                )
            else:
                # Create new
                new_token = OAuthToken(
                    company_id=company_id,
                    user_id=user_id,
                    provider="linkedin",
                    access_token=account_id,
                    refresh_token=account_id,
                    token_type="unipile_account",
                    expires_at=expires_at,
                    scope=account.get("username", "")
                )
                db.add(new_token)
            
            await db.commit()
            
            return {
                "success": True,
                "account_id": account_id,
                "profile": {
                    "id": account.get("provider_id"),
                    "name": account.get("display_name"),
                    "email": account.get("email"),
                    "username": account.get("username")
                }
            }
            
        except Exception as e:
            await db.rollback()
            return {
                "success": False,
                "error": f"Failed to handle connection: {str(e)}"
            }
    
    # ========================================================================
    # LINKEDIN ORGANIZATIONS (Company Pages)
    # ========================================================================
    
    async def get_linkedin_organizations(
        self,
        account_id: str
    ) -> Dict[str, Any]:
        """
        Get LinkedIn organizations (company pages) that user can post to.
        
        API: GET /linkedin/{account_id}/organizations
        Docs: https://developer.unipile.com/reference/linkedincontroller_getorganizations
        """
        try:
            async with httpx.AsyncClient(verify=False) as client:
                response = await client.get(
                    f"{self.api_url}/linkedin/{account_id}/organizations",
                    headers=self.headers,
                    timeout=30.0
                )
                
                response.raise_for_status()
                data = response.json()
                
                organizations = data if isinstance(data, list) else []
                
                return {
                    "success": True,
                    "organizations": organizations,
                    "count": len(organizations)
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to get organizations: {str(e)}",
                "organizations": []
            }
    
    # ========================================================================
    # JOB POSTING (DRAFT → PUBLISH FLOW)
    # ========================================================================
    
    async def create_linkedin_job_draft(
        self,
        account_id: str,
        job_title: str,
        job_description: str,
        location: str,
        employment_type: str,
        workplace_type: str,
        application_url: str,
        organization_id: Optional[str] = None,
        listed_at: Optional[int] = None,
        company_apply_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Step 1: Create LinkedIn job posting draft.
        
        API: POST /linkedin/{account_id}/job-postings
        Docs: https://developer.unipile.com/reference/linkedincontroller_createjobposting
        
        Returns:
            {
                "success": True,
                "object": "LinkedinJobPostingDraftCreated",
                "job_id": "draft_123",  // LinkedIn draft ID (use for publish)
                "project_id": "proj_456",
                "publish_options": {
                    "free": {
                        "eligible": true,
                        "estimated_monthly_applicants": 50
                    },
                    "promoted": {
                        "estimated_monthly_applicants": 200,
                        "currency": "USD",
                        "daily_budget": {...}
                    }
                }
            }
        """
        try:
            # Map employment type to LinkedIn format
            employment_type_map = {
                "FULL_TIME": "FULL_TIME",
                "PART_TIME": "PART_TIME",
                "CONTRACT": "CONTRACT",
                "TEMPORARY": "TEMPORARY",
                "VOLUNTEER": "VOLUNTEER",
                "INTERNSHIP": "INTERNSHIP"
            }
            linkedin_employment_type = employment_type_map.get(employment_type.upper(), "FULL_TIME")
            
            # Prepare payload
            payload = {
                "title": job_title[:80],  # Max 80 chars
                "description": job_description[:25000],  # Max 25,000 chars
                "location": {
                    "name": location
                },
                "employmentType": linkedin_employment_type,
                "workplaceType": workplace_type.upper(),
                "externalApplyUrl": application_url
            }
            
            # Add optional fields
            if organization_id:
                payload["organizationId"] = organization_id
            
            if listed_at:
                payload["listedAt"] = listed_at
            else:
                payload["listedAt"] = int(datetime.utcnow().timestamp() * 1000)
            
            if company_apply_url:
                payload["companyApplyUrl"] = company_apply_url
            
            # Create draft
            async with httpx.AsyncClient(verify=False) as client:
                response = await client.post(
                    f"{self.api_url}/linkedin/{account_id}/job-postings",
                    headers=self.headers,
                    json=payload,
                    timeout=60.0
                )
                
                response.raise_for_status()
                data = response.json()
            
            return {
                "success": True,
                **data  # Include all response data (object, job_id, project_id, publish_options)
            }
            
        except httpx.HTTPStatusError as e:
            error_detail = e.response.text if hasattr(e.response, 'text') else str(e)
            return {
                "success": False,
                "error": f"Failed to create draft: {error_detail}",
                "status_code": e.response.status_code if hasattr(e.response, 'status_code') else None
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to create draft: {str(e)}"
            }
    
    async def publish_linkedin_job_draft(
        self,
        account_id: str,
        job_id: str,
        use_free_posting: bool = True,
        daily_budget: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Step 2: Publish LinkedIn job draft.
        
        API: POST /linkedin/{account_id}/job-postings/{jobId}/publish
        Docs: https://developer.unipile.com/reference/linkedincontroller_publishjobposting
        
        Args:
            account_id: Unipile account ID
            job_id: LinkedIn draft job_id (from create_linkedin_job_draft)
            use_free_posting: True for free posting, False for promoted
            daily_budget: Required if use_free_posting=False
            
        Returns:
            {
                "success": True,
                "id": "linkedin_job_id",  // Actual LinkedIn job posting ID
                "url": "https://www.linkedin.com/jobs/view/...",
                "status": "OPEN",
                "created_at": "2024-01-28T10:00:00.000Z"
            }
        """
        try:
            payload = {
                "use_free_posting": use_free_posting
            }
            
            if not use_free_posting and daily_budget:
                payload["daily_budget"] = daily_budget
            
            async with httpx.AsyncClient(verify=False) as client:
                response = await client.post(
                    f"{self.api_url}/linkedin/{account_id}/job-postings/{job_id}/publish",
                    headers=self.headers,
                    json=payload,
                    timeout=60.0
                )
                
                response.raise_for_status()
                data = response.json()
            
            return {
                "success": True,
                **data  # Include all response data (id, url, status, etc.)
            }
            
        except httpx.HTTPStatusError as e:
            error_detail = e.response.text if hasattr(e.response, 'text') else str(e)
            return {
                "success": False,
                "error": f"Failed to publish job: {error_detail}",
                "status_code": e.response.status_code if hasattr(e.response, 'status_code') else None
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to publish job: {str(e)}"
            }
    
    async def create_and_publish_linkedin_job(
        self,
        db: AsyncSession,
        company_id: UUID,
        job_id: UUID,
        job_title: str,
        job_description: str,
        location: str,
        employment_type: str,
        workplace_type: str,
        application_url: str,
        organization_id: Optional[str] = None,
        use_free_posting: bool = True,
        daily_budget: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Complete flow: Create draft → Publish → Update database.
        This is the main method to use for posting jobs.
        
        Flow:
        1. Get account_id from database
        2. Create draft (get draft job_id)
        3. Publish draft (get actual LinkedIn job_id and URL)
        4. Update jobs table with LinkedIn details
        
        Returns:
            {
                "success": True,
                "draft_job_id": "draft_123",
                "linkedin_job_id": "actual_456",
                "linkedin_url": "https://...",
                "status": "OPEN",
                "publish_options": {...}
            }
        """
        try:
            # Step 1: Get account_id
            result = await db.execute(
                select(OAuthToken).where(
                    OAuthToken.company_id == company_id,
                    OAuthToken.provider == "linkedin"
                )
            )
            token = result.scalar_one_or_none()
            
            if not token:
                return {
                    "success": False,
                    "error": "LinkedIn not connected",
                    "requires_connection": True
                }
            
            account_id = token.access_token
            
            # Step 2: Create draft
            draft_result = await self.create_linkedin_job_draft(
                account_id=account_id,
                job_title=job_title,
                job_description=job_description,
                location=location,
                employment_type=employment_type,
                workplace_type=workplace_type,
                application_url=application_url,
                organization_id=organization_id
            )
            
            if not draft_result.get("success"):
                return draft_result
            
            draft_job_id = draft_result.get("job_id")
            
            if not draft_job_id:
                return {
                    "success": False,
                    "error": "No draft job_id returned from Unipile"
                }
            
            # Step 3: Publish draft
            publish_result = await self.publish_linkedin_job_draft(
                account_id=account_id,
                job_id=draft_job_id,
                use_free_posting=use_free_posting,
                daily_budget=daily_budget
            )
            
            if not publish_result.get("success"):
                return {
                    **publish_result,
                    "draft_job_id": draft_job_id,
                    "draft_created": True
                }
            
            # Step 4: Update database
            linkedin_job_id = publish_result.get("id")
            linkedin_job_url = publish_result.get("url")
            # Update job in database with LinkedIn posting info
            await db.execute(
                update(Job)
                .where(Job.id == job_id)
                .values(
                    linkedin_job_id=linkedin_job_id,
                    linkedin_job_url=linkedin_job_url,
                    linkedin_posted_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
            )
            
            # Also create JobPosting record for tracking
            from models import JobPosting
            linkedin_posting = JobPosting(
                job_id=job_id,
                platform="linkedin",
                external_id=linkedin_job_id,
                post_url=linkedin_job_url,
                status="active"
            )
            db.add(linkedin_posting)
            await db.commit()
            
            return {
                "success": True,
                "draft_job_id": draft_job_id,
                "linkedin_job_id": linkedin_job_id,
                "linkedin_url": linkedin_job_url,
                "status": publish_result.get("status", "OPEN"),
                "publish_options": draft_result.get("publish_options", {})
            }
            
        except Exception as e:
            await db.rollback()
            return {
                "success": False,
                "error": f"Complete flow failed: {str(e)}"
            }
    
    # ========================================================================
    # JOB MANAGEMENT (EDIT, CLOSE)
    # ========================================================================
    
    async def edit_linkedin_job_posting(
        self,
        account_id: str,
        job_id: str,
        job_title: Optional[str] = None,
        job_description: Optional[str] = None,
        location: Optional[str] = None,
        employment_type: Optional[str] = None,
        workplace_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Edit LinkedIn job posting (before or after publishing).
        
        API: PATCH /linkedin/{account_id}/job-postings/{jobId}
        Docs: https://developer.unipile.com/reference/linkedincontroller_editjobposting
        
        Args:
            account_id: Unipile account ID
            job_id: LinkedIn job_id (draft or published)
            
        Returns:
            {"success": True/False}
        """
        try:
            payload = {}
            
            if job_title:
                payload["title"] = job_title[:80]
            if job_description:
                payload["description"] = job_description[:25000]
            if location:
                payload["location"] = {"name": location}
            if employment_type:
                payload["employmentType"] = employment_type.upper()
            if workplace_type:
                payload["workplaceType"] = workplace_type.upper()
            
            if not payload:
                return {
                    "success": False,
                    "error": "No fields to update"
                }
            
            async with httpx.AsyncClient(verify=False) as client:
                response = await client.patch(
                    f"{self.api_url}/linkedin/{account_id}/job-postings/{job_id}",
                    headers=self.headers,
                    json=payload,
                    timeout=60.0
                )
                
                response.raise_for_status()
                data = response.json()
            
            return {
                "success": True,
                **data
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to edit job: {str(e)}"
            }
    
    async def close_linkedin_job_posting(
        self,
        account_id: str,
        job_id: str
    ) -> Dict[str, Any]:
        """
        Close LinkedIn job posting.
        
        API: POST /linkedin/{account_id}/job-postings/{jobId}/close
        Docs: https://developer.unipile.com/reference/linkedincontroller_closejobposting
        
        Args:
            account_id: Unipile account ID
            job_id: LinkedIn job_id (published job)
            
        Returns:
            {
                "success": True,
                "id": "linkedin_job_id",
                "status": "CLOSED",
                "closed_at": "2024-01-28T10:00:00.000Z"
            }
        """
        try:
            async with httpx.AsyncClient(verify=False) as client:
                response = await client.post(
                    f"{self.api_url}/linkedin/{account_id}/job-postings/{job_id}/close",
                    headers=self.headers,
                    timeout=60.0
                )
                
                response.raise_for_status()
                data = response.json()
            
            return {
                "success": True,
                **data
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to close job: {str(e)}"
            }
    
    async def get_linkedin_job_posting(
        self,
        account_id: str,
        job_id: str
    ) -> Dict[str, Any]:
        """
        Get LinkedIn job posting details.
        
        API: GET /linkedin/{account_id}/job-postings/{jobId}
        """
        try:
            async with httpx.AsyncClient(verify=False) as client:
                response = await client.get(
                    f"{self.api_url}/linkedin/{account_id}/job-postings/{job_id}",
                    headers=self.headers,
                    timeout=30.0
                )
                
                response.raise_for_status()
                data = response.json()
                
                return {
                    "success": True,
                    "job_posting": data
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to get job posting: {str(e)}"
            }
    
    # ========================================================================
    # CHECKPOINT SOLVING (for LinkedIn verification)
    # ========================================================================
    
    async def solve_linkedin_checkpoint(
        self,
        account_id: str,
        checkpoint_type: str,
        solution: str
    ) -> Dict[str, Any]:
        """
        Solve LinkedIn checkpoint/verification.
        
        API: POST /linkedin/{account_id}/checkpoints/solve
        Docs: https://developer.unipile.com/reference/linkedincontroller_solvecheckpoint
        
        Args:
            account_id: Unipile account ID
            checkpoint_type: Type of checkpoint (e.g., "email_verification")
            solution: Solution to the checkpoint
            
        Returns:
            {"success": True/False}
        """
        try:
            payload = {
                "type": checkpoint_type,
                "solution": solution
            }
            
            async with httpx.AsyncClient(verify=False) as client:
                response = await client.post(
                    f"{self.api_url}/linkedin/{account_id}/checkpoints/solve",
                    headers=self.headers,
                    json=payload,
                    timeout=60.0
                )
                
                response.raise_for_status()
                data = response.json()
            
            return {
                "success": True,
                **data
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to solve checkpoint: {str(e)}"
            }
    
    # ========================================================================
    # HELPER METHODS
    # ========================================================================
    
    async def get_linkedin_status(
        self,
        db: AsyncSession,
        company_id: UUID
    ) -> Dict[str, Any]:
        """Get LinkedIn connection status for a company."""
        try:
            result = await db.execute(
                select(OAuthToken).where(
                    OAuthToken.company_id == company_id,
                    OAuthToken.provider == "linkedin"
                )
            )
            token = result.scalar_one_or_none()
            
            if not token:
                return {
                    "connected": False,
                    "requires_connection": True
                }
            
            account_id = token.access_token
            
            # Get account details
            account_result = await self.get_account(account_id)
            
            if not account_result.get("success"):
                return {
                    "connected": False,
                    "error": account_result.get("error"),
                    "requires_connection": True
                }
            
            # Get organizations
            orgs_result = await self.get_linkedin_organizations(account_id)
            
            return {
                "connected": True,
                "account_id": account_id,
                "profile": account_result["account"],
                "organizations": orgs_result.get("organizations", []),
                "expires_at": token.expires_at
            }
            
        except Exception as e:
            return {
                "connected": False,
                "error": str(e)
            }


# Global Unipile service instance
unipile_service = UnipileService()