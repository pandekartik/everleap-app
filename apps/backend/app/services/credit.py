"""
Credit tracking service for monitoring AI token usage.
Tracks tokens used for job description generation, resume parsing, etc.
"""
from decimal import Decimal
from typing import Any, Dict, Optional
from uuid import UUID

from sqlalchemy import insert, select, func
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from models import CreditUsage, Company


class CreditService:
    """Service for tracking AI credit usage."""
    
    @staticmethod
    async def track_usage(
        db: AsyncSession,
        company_id: UUID,
        user_id: Optional[UUID],
        operation: str,
        input_tokens: int,
        output_tokens: int,
        resource_type: Optional[str] = None,
        resource_id: Optional[UUID] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> CreditUsage:
        """
        Track AI credit usage with separate input/output tokens.
        
        Args:
            db: Database session
            company_id: Company ID
            user_id: User who performed operation (optional)
            operation: Operation type (e.g., 'jd_generation', 'resume_parsing')
            input_tokens: Number of input/prompt tokens
            output_tokens: Number of output/completion tokens
            resource_type: Type of resource (e.g., 'job', 'application')
            resource_id: ID of related resource
            metadata: Additional metadata
            
        Returns:
            CreditUsage record
        """
        total_tokens = input_tokens + output_tokens
        cost_per_token = Decimal(str(settings.TOKEN_COST_PER_1K)) / 1000
        total_cost = cost_per_token * Decimal(total_tokens)
        
        stmt = insert(CreditUsage).values(
            company_id=company_id,
            user_id=user_id,
            operation=operation,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=total_tokens,
            cost_per_token=cost_per_token,
            total_cost=total_cost,
            resource_type=resource_type,
            resource_id=resource_id,
            credit_usage_metadata=metadata
        ).returning(CreditUsage)
        
        result = await db.execute(stmt)
        await db.commit()
        
        return result.scalar_one()
    
    @staticmethod
    async def track_jd_generation(
        db: AsyncSession,
        company_id: UUID,
        user_id: UUID,
        job_id: UUID,
        input_tokens: int,
        output_tokens: int
    ) -> CreditUsage:
        """Track job description generation credits with detailed token breakdown."""
        return await CreditService.track_usage(
            db=db,
            company_id=company_id,
            user_id=user_id,
            operation="jd_generation",
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            resource_type="job",
            resource_id=job_id,
            metadata={
                "operation_name": "Job Description Generation",
                "note": "Includes market research + JD generation"
            }
        )
    
    @staticmethod
    async def track_resume_parsing(
        db: AsyncSession,
        company_id: UUID,
        user_id: Optional[UUID],
        application_id: UUID,
        input_tokens: int,
        output_tokens: int
    ) -> CreditUsage:
        """Track resume parsing credits with token breakdown."""
        return await CreditService.track_usage(
            db=db,
            company_id=company_id,
            user_id=user_id,
            operation="resume_parsing",
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            resource_type="application",
            resource_id=application_id,
            metadata={"operation_name": "Resume Parsing"}
        )
    
    @staticmethod
    async def track_resume_screening(
        db: AsyncSession,
        company_id: UUID,
        user_id: Optional[UUID],
        application_id: UUID,
        input_tokens: int,
        output_tokens: int
    ) -> CreditUsage:
        """Track resume screening credits with token breakdown."""
        return await CreditService.track_usage(
            db=db,
            company_id=company_id,
            user_id=user_id,
            operation="resume_screening",
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            resource_type="application",
            resource_id=application_id,
            metadata={"operation_name": "Resume Screening"}
        )
    
    @staticmethod
    async def get_company_usage(
        db: AsyncSession,
        company_id: UUID
    ) -> Dict[str, Any]:
        """
        Get credit usage summary for a company.
        
        Args:
            db: Database session
            company_id: Company ID
            
        Returns:
            Dictionary with usage statistics
        """
        # Get total usage
        total_query = select(
            func.sum(CreditUsage.tokens_used).label('total_tokens'),
            func.sum(CreditUsage.total_cost).label('total_cost'),
            func.count(CreditUsage.id).label('total_operations')
        ).where(CreditUsage.company_id == company_id)
        
        total_result = await db.execute(total_query)
        total_row = total_result.first()
        
        # Get usage by operation
        by_operation_query = select(
            CreditUsage.operation,
            func.sum(CreditUsage.tokens_used).label('tokens'),
            func.sum(CreditUsage.total_cost).label('cost'),
            func.count(CreditUsage.id).label('count')
        ).where(
            CreditUsage.company_id == company_id
        ).group_by(CreditUsage.operation)
        
        by_operation_result = await db.execute(by_operation_query)
        by_operation = {
            row.operation: {
                "tokens": int(row.tokens or 0),
                "cost": float(row.cost or 0),
                "count": row.count
            }
            for row in by_operation_result.all()
        }
        
        # Get company info
        company_query = select(Company).where(Company.id == company_id)
        company_result = await db.execute(company_query)
        company = company_result.scalar_one_or_none()
        
        return {
            "company_id": str(company_id),
            "total_tokens_used": int(total_row.total_tokens or 0),
            "total_cost": float(total_row.total_cost or 0),
            "total_operations": total_row.total_operations or 0,
            "credits_limit": company.api_credits_limit if company else 0,
            "credits_remaining": (company.api_credits_limit - company.api_credits_used) if company else 0,
            "usage_by_operation": by_operation
        }
    
    @staticmethod
    async def check_credits_available(
        db: AsyncSession,
        company_id: UUID,
        required_tokens: int
    ) -> bool:
        """
        Check if company has enough credits available.
        
        Args:
            db: Database session
            company_id: Company ID
            required_tokens: Number of tokens required
            
        Returns:
            True if credits available, False otherwise
        """
        query = select(Company).where(Company.id == company_id)
        result = await db.execute(query)
        company = result.scalar_one_or_none()
        
        if not company:
            return False
        
        available_credits = company.api_credits_limit - company.api_credits_used
        return available_credits >= required_tokens
    
    @staticmethod
    async def get_job_token_summary(
        db: AsyncSession,
        job_id: UUID
    ) -> Dict[str, Any]:
        """
        Get token usage summary for a specific job.
        Includes JD generation + all resume processing for this job.
        
        Args:
            db: Database session
            job_id: Job ID
            
        Returns:
            Dictionary with detailed token breakdown
        """
        from sqlalchemy import text
        
        query = text("""
            SELECT 
                job_id,
                unique_job_code,
                job_title,
                jd_input_tokens,
                jd_output_tokens,
                jd_total_tokens,
                resume_input_tokens,
                resume_output_tokens,
                resume_total_tokens,
                total_tokens_for_job,
                resume_count,
                total_cost
            FROM job_token_summary
            WHERE job_id = :job_id
        """)
        
        result = await db.execute(query, {"job_id": str(job_id)})
        row = result.first()
        
        if not row:
            return {
                "job_id": str(job_id),
                "jd_tokens": {"input": 0, "output": 0, "total": 0},
                "resume_tokens": {"input": 0, "output": 0, "total": 0},
                "total_tokens": 0,
                "resume_count": 0,
                "total_cost": 0.0
            }
        
        return {
            "job_id": str(row.job_id),
            "job_code": row.unique_job_code,
            "job_title": row.job_title,
            "jd_tokens": {
                "input": int(row.jd_input_tokens or 0),
                "output": int(row.jd_output_tokens or 0),
                "total": int(row.jd_total_tokens or 0)
            },
            "resume_tokens": {
                "input": int(row.resume_input_tokens or 0),
                "output": int(row.resume_output_tokens or 0),
                "total": int(row.resume_total_tokens or 0)
            },
            "total_tokens": int(row.total_tokens_for_job or 0),
            "resume_count": int(row.resume_count or 0),
            "avg_tokens_per_resume": (
                int(row.resume_total_tokens or 0) / int(row.resume_count or 1)
                if row.resume_count > 0 else 0
            ),
            "total_cost": float(row.total_cost or 0)
        }


# Global credit service instance
credit_service = CreditService()
