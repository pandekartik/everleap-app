"""
Audit logging service for tracking user actions and system events.
"""
from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID

from sqlalchemy import insert
from sqlalchemy.ext.asyncio import AsyncSession

from models import AuditAction, AuditLog


class AuditService:
    """Service for creating audit logs."""
    
    @staticmethod
    async def log_action(
        db: AsyncSession,
        action: AuditAction,
        company_id: Optional[UUID] = None,
        user_id: Optional[UUID] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[UUID] = None,
        old_values: Optional[Dict[str, Any]] = None,
        new_values: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> None:
        """
        Create an audit log entry.
        
        Args:
            db: Database session
            action: Audit action type
            company_id: Company ID (optional)
            user_id: User ID who performed action (optional)
            resource_type: Type of resource (e.g., 'user', 'job')
            resource_id: ID of affected resource
            old_values: Previous values before change
            new_values: New values after change
            metadata: Additional metadata
            ip_address: IP address of request
            user_agent: User agent string
        """
        stmt = insert(AuditLog).values(
            action=action,
            company_id=company_id,
            user_id=user_id,
            resource_type=resource_type,
            resource_id=resource_id,
            old_values=old_values,
            new_values=new_values,
            auditlog_metadata=metadata,
            ip_address=ip_address,
            user_agent=user_agent,
            created_at=datetime.utcnow()
        )
        
        await db.execute(stmt)
        await db.commit()
    
    @staticmethod
    async def log_user_creation(
        db: AsyncSession,
        created_by_id: UUID,
        company_id: UUID,
        user_id: UUID,
        user_email: str,
        role: str,
        ip_address: Optional[str] = None
    ) -> None:
        """Log user creation event."""
        await AuditService.log_action(
            db=db,
            action=AuditAction.CREATE,
            company_id=company_id,
            user_id=created_by_id,
            resource_type="user",
            resource_id=user_id,
            new_values={"email": user_email, "role": role},
            metadata={"action_type": "user_creation"},
            ip_address=ip_address
        )
    
    @staticmethod
    async def log_role_assignment(
        db: AsyncSession,
        assigned_by_id: UUID,
        company_id: UUID,
        target_user_id: UUID,
        role: str,
        ip_address: Optional[str] = None
    ) -> None:
        """Log role assignment event."""
        await AuditService.log_action(
            db=db,
            action=AuditAction.ROLE_ASSIGNED,
            company_id=company_id,
            user_id=assigned_by_id,
            resource_type="user",
            resource_id=target_user_id,
            new_values={"role": role},
            metadata={"action_type": "role_assignment"},
            ip_address=ip_address
        )
    
    @staticmethod
    async def log_job_posted(
        db: AsyncSession,
        user_id: UUID,
        company_id: UUID,
        job_id: UUID,
        job_title: str,
        platforms: list,
        ip_address: Optional[str] = None
    ) -> None:
        """Log job posting event."""
        await AuditService.log_action(
            db=db,
            action=AuditAction.JOB_POSTED,
            company_id=company_id,
            user_id=user_id,
            resource_type="job",
            resource_id=job_id,
            new_values={"job_title": job_title, "platforms": platforms},
            metadata={"action_type": "job_posted"},
            ip_address=ip_address
        )
    
    @staticmethod
    async def log_application_submitted(
        db: AsyncSession,
        candidate_id: UUID,
        company_id: UUID,
        job_id: UUID,
        application_id: UUID,
        job_title: str,
        ip_address: Optional[str] = None
    ) -> None:
        """Log application submission event."""
        await AuditService.log_action(
            db=db,
            action=AuditAction.APPLICATION_SUBMITTED,
            company_id=company_id,
            user_id=candidate_id,
            resource_type="application",
            resource_id=application_id,
            new_values={"job_id": str(job_id), "job_title": job_title},
            metadata={"action_type": "application_submitted"},
            ip_address=ip_address
        )
    
    @staticmethod
    async def log_hiring_decision(
        db: AsyncSession,
        user_id: UUID,
        company_id: UUID,
        application_id: UUID,
        old_status: str,
        new_status: str,
        ip_address: Optional[str] = None
    ) -> None:
        """Log hiring decision event."""
        await AuditService.log_action(
            db=db,
            action=AuditAction.HIRING_DECISION,
            company_id=company_id,
            user_id=user_id,
            resource_type="application",
            resource_id=application_id,
            old_values={"status": old_status},
            new_values={"status": new_status},
            metadata={"action_type": "hiring_decision"},
            ip_address=ip_address
        )
    
    @staticmethod
    async def log_login(
        db: AsyncSession,
        user_id: UUID,
        company_id: Optional[UUID],
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> None:
        """Log user login event."""
        await AuditService.log_action(
            db=db,
            action=AuditAction.LOGIN,
            company_id=company_id,
            user_id=user_id,
            resource_type="user",
            resource_id=user_id,
            metadata={"action_type": "login"},
            ip_address=ip_address,
            user_agent=user_agent
        )


# Global audit service instance
audit_service = AuditService()
