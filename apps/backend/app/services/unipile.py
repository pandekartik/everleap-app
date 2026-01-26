"""
Unipile API integration for LinkedIn job posting.
"""
from typing import Any, Dict, Optional
from uuid import UUID

import httpx

from core.config import settings


class UnipileService:
    """
    Service for posting jobs to LinkedIn via Unipile API.
    """
    
    def __init__(self):
        """Initialize Unipile service."""
        self.api_key = settings.UNIPILE_API_KEY
        self.api_url = settings.UNIPILE_API_URL
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def post_job_to_linkedin(
        self,
        job_title: str,
        job_description: str,
        location: str,
        employment_type: str,
        company_name: str,
        application_url: str,
        company_linkedin_page_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Post job to LinkedIn via Unipile.
        
        Args:
            job_title: Job title
            job_description: Full job description
            location: Job location
            employment_type: FULL_TIME, PART_TIME, CONTRACT, etc.
            company_name: Company name
            application_url: URL to apply
            company_linkedin_page_id: LinkedIn company page ID
            
        Returns:
            Dict with job posting result including LinkedIn URL
        """
        try:
            # Map employment type to LinkedIn format
            linkedin_employment_type_map = {
                "FULL_TIME": "FULL_TIME",
                "PART_TIME": "PART_TIME",
                "CONTRACT": "CONTRACT",
                "INTERNSHIP": "INTERN"
            }
            
            linkedin_type = linkedin_employment_type_map.get(employment_type, "FULL_TIME")
            
            payload = {
                "provider": "linkedin",
                "job": {
                    "title": job_title,
                    "description": job_description,
                    "location": location,
                    "employment_type": linkedin_type,
                    "company_name": company_name,
                    "apply_url": application_url
                }
            }
            
            if company_linkedin_page_id:
                payload["company_page_id"] = company_linkedin_page_id
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_url}/jobs",
                    headers=self.headers,
                    json=payload,
                    timeout=30.0
                )
                
                response.raise_for_status()
                data = response.json()
                
                return {
                    "success": True,
                    "job_id": data.get("id"),
                    "linkedin_url": data.get("url"),
                    "status": data.get("status", "posted")
                }
                
        except httpx.HTTPError as e:
            return {
                "success": False,
                "error": f"LinkedIn posting failed: {str(e)}",
                "linkedin_url": None
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Unipile error: {str(e)}",
                "linkedin_url": None
            }
    
    async def get_job_status(self, job_id: str) -> Dict[str, Any]:
        """
        Get status of posted job.
        
        Args:
            job_id: Unipile job ID
            
        Returns:
            Job status information
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.api_url}/jobs/{job_id}",
                    headers=self.headers,
                    timeout=10.0
                )
                
                response.raise_for_status()
                return response.json()
                
        except Exception as e:
            return {"error": str(e)}


# Global Unipile service instance
unipile_service = UnipileService()
