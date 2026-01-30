"""
Complete Unipile API integration for LinkedIn.
Based on official Unipile documentation with proper draft-publish flow.

API Base URL: https://api27.unipile.com:15749/api/v1/
"""
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from uuid import UUID

import httpx
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from models import OAuthToken, Job

logger = logging.getLogger(__name__)


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
        self.api_url = settings.UNIPILE_API_URL.rstrip('/')  # Remove trailing slash
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
        
        Required fields:
        - expiresOn: ISO 8601 datetime (YYYY-MM-DDTHH:MM:SS.sssZ)
        - api_url: Your Unipile server URL
        - type: "create" for new connections
        - providers: Array of providers like ["LINKEDIN"]
        """
        try:
            # Calculate expiration (24 hours from now)
            expires_on = (datetime.utcnow() + timedelta(hours=24)).strftime("%Y-%m-%dT%H:%M:%S.000Z")
            
            payload = {
                "type": "create",
                "providers": [provider],
                "api_url": self.api_url,
                "expiresOn": expires_on,
                "notify_url": success_redirect_url,  # Backend webhook URL - Unipile will POST account_id here
                "success_redirect_url": "https://www.everleap.in/dashboard?linkedin=success",  # User sees this after OAuth
                "failure_redirect_url": failure_redirect_url
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
            error_detail = e.response.text if hasattr(e, 'response') and hasattr(e.response, 'text') else str(e)
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
            # Get account details from Unipile (optional - for profile info)
            account = {}
            try:
                account_result = await self.get_account(account_id)
                if account_result.get("success"):
                    account = account_result.get("account", {})
            except Exception as e:
                # Log but don't fail - we can still save the account_id
                print(f"[UNIPILE] Warning: Could not get account details: {e}")
            
            # Store in database
            result = await db.execute(
                select(OAuthToken).where(
                    OAuthToken.company_id == company_id,
                    OAuthToken.provider == "linkedin"
                )
            )
            existing_token = result.scalar_one_or_none()
            
            # Set far-future expiry (Unipile accounts don't expire traditionally)
            expires_at = datetime.utcnow() + timedelta(days=60)  # Unipile suggests ~60 days
            
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
            
            print(f"[UNIPILE] Successfully saved LinkedIn account_id={account_id} for company={company_id}")
            
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
            print(f"[UNIPILE] Error saving account: {e}")
            return {
                "success": False,
                "error": f"Failed to handle connection: {str(e)}"
            }
    
    # ========================================================================
    # LINKEDIN COMPANY PROFILE (For Job Posting)
    # ========================================================================
    
    async def get_linkedin_company_profile(
        self,
        account_id: str,
        company_identifier: str
    ) -> Dict[str, Any]:
        """
        Get LinkedIn company profile by company identifier.
        
        The company_identifier can be:
        - Company vanity name (e.g., 'everleap-in' from linkedin.com/company/everleap-in)
        - Company ID (numeric ID like '109701240')
        - Company URN
        
        API: GET /api/v1/linkedin/company/{identifier}?account_id=xxx
        Docs: https://developer.unipile.com/reference/linkedincontroller_getcompanyprofile
        
        Returns company details including organization_id needed for job posting.
        """
        try:
            async with httpx.AsyncClient(verify=False) as client:
                # Correct endpoint: /linkedin/company/{identifier}?account_id=xxx
                response = await client.get(
                    f"{self.api_url}/linkedin/company/{company_identifier}",
                    headers=self.headers,
                    params={
                        "account_id": account_id
                    },
                    timeout=30.0
                )
                
                response.raise_for_status()
                data = response.json()
                
                return {
                    "success": True,
                    "company": data,
                    "organization_id": data.get("id") or data.get("entity_urn") or data.get("entityUrn") or data.get("company_id"),
                    "name": data.get("name"),
                    "vanity_name": data.get("vanityName") or data.get("vanity_name") or data.get("universal_name"),
                    "logo_url": data.get("logoUrl") or data.get("logo_url") or data.get("logo"),
                    "follower_count": data.get("followerCount") or data.get("follower_count"),
                    "description": data.get("description")
                }
                
        except httpx.HTTPError as e:
            error_detail = ""
            if hasattr(e, 'response') and hasattr(e.response, 'text'):
                error_detail = e.response.text
            return {
                "success": False,
                "error": f"Failed to get company profile: {error_detail or str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to get company profile: {str(e)}"
            }
    
    async def search_linkedin_companies(
        self,
        account_id: str,
        company_name: str
    ) -> Dict[str, Any]:
        """
        Search for LinkedIn companies by name.
        
        API: POST /api/v1/linkedin/search
        Docs: https://developer.unipile.com/reference/linkedincontroller_search
        
        This helps Admin find their company to get the organization_id.
        """
        try:
            async with httpx.AsyncClient(verify=False) as client:
                response = await client.post(
                    f"{self.api_url}/linkedin/search",
                    headers=self.headers,
                    json={
                        "account_id": account_id,
                        "type": "COMPANIES",
                        "keywords": company_name
                    },
                    timeout=30.0
                )
                
                response.raise_for_status()
                data = response.json()
                
                companies = data.get("items", []) if isinstance(data, dict) else data
                
                return {
                    "success": True,
                    "companies": companies,
                    "count": len(companies)
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to search companies: {str(e)}",
                "companies": []
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
        company_name: str,
        application_url: Optional[str] = None,  # Career page URL for applicants
        screening_questions: Optional[list] = None,
        auto_rejection_template: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Step 1: Create LinkedIn job posting draft.
        
        API: POST /linkedin/jobs
        Docs: https://developer.unipile.com/reference/linkedincontroller_createjobposting
        
        Body Params per Unipile docs:
        - account_id: string (required) - An Unipile account id
        - job_title: {text: string} (required) - Plain text job title
        - company: {text: string} (required) - Plain text company name
        - workplace: enum (required) - ON_SITE, HYBRID, REMOTE
        - location: string (required) - Location ID or name
        - employment_status: enum - FULL_TIME, PART_TIME, CONTRACT, etc.
        - description: string (required) - HTML formatted
        - screening_questions: array (optional)
        - auto_rejection_template: string (optional)
        
        Returns:
            {
                "success": True,
                "object": "LinkedinJobPostingDraftCreated",
                "job_id": "draft_123",
                "project_id": "proj_456",
                "publish_options": {...}
            }
        """
        try:
            # Map employment type to LinkedIn format
            employment_status_map = {
                "FULL_TIME": "FULL_TIME",
                "PART_TIME": "PART_TIME",
                "CONTRACT": "CONTRACT",
                "TEMPORARY": "TEMPORARY",
                "OTHER": "OTHER",
                "VOLUNTEER": "VOLUNTEER",
                "INTERNSHIP": "INTERNSHIP"
            }
            linkedin_employment_status = employment_status_map.get(employment_type.upper(), "FULL_TIME")
            
            # Map workplace type
            workplace_map = {
                "ON_SITE": "ON_SITE",
                "ONSITE": "ON_SITE",
                "HYBRID": "HYBRID",
                "REMOTE": "REMOTE"
            }
            linkedin_workplace = workplace_map.get(workplace_type.upper(), "ON_SITE")
            
            # Prepare payload per Unipile API docs
            # NOTE: location requires numeric ID from Unipile search params API
            # We skip location for now if it's not a numeric ID
            payload = {
                "account_id": account_id,
                "job_title": {"text": job_title[:200]},  # Plain text based job title
                "company": {"text": company_name[:200]},  # Plain text based company
                "workplace": linkedin_workplace,
                "employment_status": linkedin_employment_status,
                "description": job_description[:25000]  # HTML formatted, max 25,000 chars
            }
            
            # Only add location if it's a numeric ID (Unipile requirement)
            # TODO: Add location lookup service to convert text locations to IDs
            if location and location.isdigit():
                payload["location"] = location
            
            # Add optional fields
            if screening_questions:
                # Format screening questions for Unipile
                formatted_questions = []
                for q in screening_questions:
                    formatted_questions.append({
                        "question": q.get("question", ""),
                        "required": q.get("required", False)
                    })
                payload["screening_questions"] = formatted_questions
            
            if auto_rejection_template:
                payload["auto_rejection_template"] = auto_rejection_template
            
            # Add application URL (career page URL) for applicant redirection
            if application_url:
                payload["company_apply_url"] = application_url
            
            logger.info(f"Creating LinkedIn job draft - URL: {self.api_url}/linkedin/jobs")
            logger.debug(f"LinkedIn job draft payload: {payload}")
            
            # Create draft - Unipile API: POST /linkedin/jobs
            async with httpx.AsyncClient(verify=False) as client:
                response = await client.post(
                    f"{self.api_url}/linkedin/jobs",
                    headers=self.headers,
                    json=payload,
                    timeout=60.0
                )
                
                response.raise_for_status()
                data = response.json()
            
            logger.info(f"LinkedIn job draft created successfully: {data}")
            
            return {
                "success": True,
                **data  # Include all response data (object, job_id, project_id, publish_options)
            }
            
        except httpx.HTTPStatusError as e:
            error_detail = e.response.text if hasattr(e.response, 'text') else str(e)
            logger.error(f"LinkedIn job draft failed - HTTP {e.response.status_code}: {error_detail}")
            return {
                "success": False,
                "error": f"Failed to create draft: {error_detail}",
                "status_code": e.response.status_code if hasattr(e.response, 'status_code') else None
            }
        except Exception as e:
            logger.exception(f"LinkedIn job draft exception: {str(e)}")
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
            
            # Add account_id to body - Unipile API needs this
            payload["account_id"] = account_id
            
            logger.info(f"Publishing LinkedIn job draft - URL: {self.api_url}/linkedin/jobs/{job_id}/publish")
            logger.debug(f"Publish payload: {payload}")
            
            # Unipile API: POST /linkedin/jobs/{draft_id}/publish
            async with httpx.AsyncClient(verify=False) as client:
                response = await client.post(
                    f"{self.api_url}/linkedin/jobs/{job_id}/publish",
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
        company_name: str,
        application_url: Optional[str] = None,  # Career page URL for applicants
        screening_questions: Optional[list] = None,
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
                company_name=company_name,
                application_url=application_url,
                screening_questions=screening_questions
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
        
        API: PATCH /linkedin/jobs/{job_id}
        Docs: https://developer.unipile.com/reference/linkedincontroller_editjobposting
        
        Body params: account_id (required), job_title, company, workplace, location, 
        employment_status, description, screening_questions
        """
        try:
            # account_id is required in body
            payload = {
                "account_id": account_id
            }
            
            if job_title:
                payload["job_title"] = {"text": job_title[:200]}
            if job_description:
                payload["description"] = job_description[:25000]
            if location:
                payload["location"] = location
            if employment_type:
                employment_map = {"FULL_TIME": "FULL_TIME", "PART_TIME": "PART_TIME", 
                                  "CONTRACT": "CONTRACT", "TEMPORARY": "TEMPORARY",
                                  "OTHER": "OTHER", "VOLUNTEER": "VOLUNTEER", "INTERNSHIP": "INTERNSHIP"}
                payload["employment_status"] = employment_map.get(employment_type.upper(), "FULL_TIME")
            if workplace_type:
                workplace_map = {"ON_SITE": "ON_SITE", "ONSITE": "ON_SITE", "HYBRID": "HYBRID", "REMOTE": "REMOTE"}
                payload["workplace"] = workplace_map.get(workplace_type.upper(), "ON_SITE")
            
            if len(payload) <= 1:  # Only account_id, no fields to update
                return {
                    "success": False,
                    "error": "No fields to update"
                }
            
            logger.info(f"Editing LinkedIn job - URL: {self.api_url}/linkedin/jobs/{job_id}")
            logger.debug(f"Edit payload: {payload}")
            
            # Unipile API: PATCH /linkedin/jobs/{job_id}
            async with httpx.AsyncClient(verify=False) as client:
                response = await client.patch(
                    f"{self.api_url}/linkedin/jobs/{job_id}",
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
            # Unipile API: POST /linkedin/jobs/{job_id}/close?account_id=xxx
            async with httpx.AsyncClient(verify=False) as client:
                response = await client.post(
                    f"{self.api_url}/linkedin/jobs/{job_id}/close",
                    headers=self.headers,
                    params={"account_id": account_id},
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
        
        API: GET /linkedin/jobs/{jobId}?account_id=xxx
        """
        try:
            # Unipile API: GET /linkedin/jobs/{job_id}?account_id=xxx
            async with httpx.AsyncClient(verify=False) as client:
                response = await client.get(
                    f"{self.api_url}/linkedin/jobs/{job_id}",
                    headers=self.headers,
                    params={"account_id": account_id},
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