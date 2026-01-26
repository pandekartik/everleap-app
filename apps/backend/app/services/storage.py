"""
Google Cloud Storage service for file management.
Handles resume uploads, signed URLs, and file operations.
"""
import os
from datetime import timedelta
from typing import Optional
from uuid import UUID

from google.cloud import storage
from google.oauth2 import service_account

from core.config import settings


class GCSService:
    """Service for managing files in Google Cloud Storage."""
    
    def __init__(self):
        """Initialize GCS client with service account credentials."""
        if settings.GCS_CREDENTIALS_PATH and os.path.exists(settings.GCS_CREDENTIALS_PATH):
            credentials = service_account.Credentials.from_service_account_file(
                settings.GCS_CREDENTIALS_PATH
            )
            self.client = storage.Client(
                credentials=credentials,
                project=settings.GCS_PROJECT_ID
            )
        else:
            # Use default credentials (for GCE, Cloud Run, etc.)
            self.client = storage.Client(project=settings.GCS_PROJECT_ID)
        
        self.bucket_name = settings.GCS_BUCKET_NAME
        self.bucket = self.client.bucket(self.bucket_name)
    
    def generate_resume_path(
        self,
        company_id: UUID,
        job_id: UUID,
        candidate_id: UUID,
        filename: str
    ) -> str:
        """
        Generate standardized GCS path for resume.
        Format: resumes/{company_id}/{job_id}/{candidate_id}/{filename}
        
        Args:
            company_id: Company UUID
            job_id: Job UUID
            candidate_id: Candidate UUID
            filename: Original filename
            
        Returns:
            GCS path string
        """
        # Sanitize filename
        safe_filename = filename.replace(" ", "_").replace("/", "_")
        return f"resumes/{company_id}/{job_id}/{candidate_id}/{safe_filename}"
    
    async def upload_resume(
        self,
        file_content: bytes,
        company_id: UUID,
        job_id: UUID,
        candidate_id: UUID,
        filename: str,
        content_type: str = "application/pdf"
    ) -> str:
        """
        Upload resume to GCS.
        
        Args:
            file_content: File content as bytes
            company_id: Company UUID
            job_id: Job UUID
            candidate_id: Candidate UUID
            filename: Original filename
            content_type: File MIME type
            
        Returns:
            GCS path of uploaded file
        """
        gcs_path = self.generate_resume_path(company_id, job_id, candidate_id, filename)
        blob = self.bucket.blob(gcs_path)
        
        # Upload with metadata
        blob.metadata = {
            "company_id": str(company_id),
            "job_id": str(job_id),
            "candidate_id": str(candidate_id),
            "original_filename": filename
        }
        
        blob.upload_from_string(
            file_content,
            content_type=content_type
        )
        
        return gcs_path
    
    def get_signed_url(
        self,
        gcs_path: str,
        expiration: Optional[int] = None
    ) -> str:
        """
        Generate signed URL for temporary file access.
        
        Args:
            gcs_path: GCS path to file
            expiration: Expiration time in seconds (default from settings)
            
        Returns:
            Signed URL string
        """
        if expiration is None:
            expiration = settings.GCS_SIGNED_URL_EXPIRATION
        
        blob = self.bucket.blob(gcs_path)
        
        url = blob.generate_signed_url(
            version="v4",
            expiration=timedelta(seconds=expiration),
            method="GET"
        )
        
        return url
    
    async def delete_resume(self, gcs_path: str) -> bool:
        """
        Delete resume from GCS.
        
        Args:
            gcs_path: GCS path to file
            
        Returns:
            True if deleted, False otherwise
        """
        try:
            blob = self.bucket.blob(gcs_path)
            blob.delete()
            return True
        except Exception:
            return False
    
    def file_exists(self, gcs_path: str) -> bool:
        """
        Check if file exists in GCS.
        
        Args:
            gcs_path: GCS path to file
            
        Returns:
            True if exists, False otherwise
        """
        blob = self.bucket.blob(gcs_path)
        return blob.exists()
    
    async def get_file_size(self, gcs_path: str) -> Optional[int]:
        """
        Get file size in bytes.
        
        Args:
            gcs_path: GCS path to file
            
        Returns:
            File size in bytes or None if not found
        """
        try:
            blob = self.bucket.blob(gcs_path)
            blob.reload()
            return blob.size
        except Exception:
            return None
    
    async def download_file(self, gcs_path: str) -> Optional[bytes]:
        """
        Download file content from GCS.
        
        Args:
            gcs_path: GCS path to file
            
        Returns:
            File content as bytes or None if not found
        """
        try:
            blob = self.bucket.blob(gcs_path)
            return blob.download_as_bytes()
        except Exception:
            return None


# Global GCS service instance
gcs_service = GCSService()
