"""
Jobs API endpoints - Complete implementation.
Handles job creation, AI generation, publishing, and management.
"""
import json
import logging
from datetime import datetime, timezone
from math import ceil
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile, status
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from agents.jd_generator import job_description_agent
from core.config import settings
from core.rbac import CurrentUser, UserRole, check_company_access, get_current_verified_user
from db.session import get_db
from models import Company, Job, JobPosting
from schemas.job import (
    JobCreate,
    JobListItem,
    JobPublishRequest,
    JobResponse,
    JobUpdate,
    PaginatedJobResponse,
)
from schemas.linkedin import (
    PostJobToLinkedInRequest,
    PostJobToLinkedInResponse,
    LinkedInJobStatus
)
from services.audit import audit_service
from services.credit import credit_service
from services.unipile import unipile_service


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    request: Request,
    job_data: JobCreate,
    current_user: CurrentUser = Depends(get_current_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create new job (HR, ADMIN, SUPER_ADMIN).
    If direct_job_post=false, uses AI agents to generate job description.
    """
    if not current_user.has_any_role(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HR, Admin, or Super Admin can create jobs"
        )
    
    # Validate company access
    check_company_access(current_user, current_user.company_id)
    
    # Create job record
    job = Job(
        company_id=current_user.company_id,
        created_by=current_user.id,
        job_title=job_data.job_title,
        department=job_data.department,
        employment_type=job_data.employment_type,
        location=job_data.location,
        is_remote=job_data.is_remote,
        compensation_min=job_data.compensation_min,
        compensation_max=job_data.compensation_max,
        currency=job_data.currency,
        equity=job_data.equity,
        direct_job_post=job_data.direct_job_post,
        screening_questions=[q.model_dump() for q in job_data.screening_questions] if job_data.screening_questions else None,
        status="draft"
    )
    
    db.add(job)
    await db.flush()
    
    # Generate job description if not direct post
    if not job_data.direct_job_post:
        try:
            # Get company diversity policy
            company_result = await db.execute(
                select(Company).where(Company.id == current_user.company_id)
            )
            company = company_result.scalar_one()
            
            # Prepare input for agent
            agent_input = json.dumps({
                "job_title": job_data.job_title,
                "department": job_data.department,
                "employment_type": job_data.employment_type,
                "location": job_data.location,
                "is_remote": job_data.is_remote,
                "compensation_min": float(job_data.compensation_min) if job_data.compensation_min else None,
                "compensation_max": float(job_data.compensation_max) if job_data.compensation_max else None,
                "currency": job_data.currency,
                "equity": job_data.equity
            })
            
            # Run JD generation agent with company info
            result = await job_description_agent.execute(
                input_data=agent_input,
                metadata={
                    "diversity_policy": company.diversity_policy,
                    "company_name": company.name
                }
            )
            
            if result.success:
                output = json.loads(result.output)
                job.job_description = output["job_description"]
                job.screening_questions = output.get("screening_questions")
                job.tokens_used = result.total_tokens
                
                # Track credit usage with detailed token breakdown
                await credit_service.track_jd_generation(
                    db=db,
                    company_id=current_user.company_id,
                    user_id=current_user.id,
                    job_id=job.id,
                    input_tokens=result.input_tokens,
                    output_tokens=result.output_tokens
                )
            else:
                job.status = "draft_error"
                job.job_description = f"AI generation failed: {result.error}"
        
        except Exception as e:
            job.status = "draft_error"
            job.job_description = f"Error: {str(e)}"
    
    await db.commit()
    await db.refresh(job)
    
    return job


@router.get("", response_model=PaginatedJobResponse)
async def list_jobs(
    current_user: CurrentUser = Depends(get_current_verified_user),
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    status: Optional[str] = None
):
    """List jobs with pagination."""
    if not current_user.has_any_role(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    # Build query
    query = select(Job).where(
        Job.company_id == current_user.company_id,
        Job.deleted_at.is_(None)
    )
    
    if status:
        query = query.where(Job.status == status)
    
    # Count total
    count_query = select(func.count(Job.id)).where(
        Job.company_id == current_user.company_id,
        Job.deleted_at.is_(None)
    )
    if status:
        count_query = count_query.where(Job.status == status)
    
    total = await db.scalar(count_query)
    
    # Get paginated results
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size).order_by(Job.created_at.desc())
    
    result = await db.execute(query)
    jobs = result.scalars().all()
    
    # Build response items
    items = [
        JobListItem(
            id=job.id,
            job_title=job.job_title,
            department=job.department,
            employment_type=job.employment_type,
            location=job.location,
            is_remote=job.is_remote,
            compensation_min=job.compensation_min,
            compensation_max=job.compensation_max,
            currency=job.currency,
            is_published=job.is_published,
            published_at=job.published_at,
            unique_job_code=job.unique_job_code,
            status=job.status,
            total_applications=0,  # TODO: Count applications
            created_at=job.created_at
        )
        for job in jobs
    ]
    
    return PaginatedJobResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=ceil(total / page_size) if total > 0 else 0
    )


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: UUID,
    current_user: CurrentUser = Depends(get_current_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """Get job by ID."""
    result = await db.execute(
        select(Job).where(
            Job.id == job_id,
            Job.deleted_at.is_(None)
        )
    )
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    
    check_company_access(current_user, job.company_id)
    
    return job


@router.patch("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: UUID,
    job_update: JobUpdate,
    current_user: CurrentUser = Depends(get_current_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """Update job."""
    if not current_user.has_any_role(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    check_company_access(current_user, job.company_id)
    
    # Update fields
    update_data = job_update.model_dump(exclude_unset=True)
    await db.execute(update(Job).where(Job.id == job_id).values(**update_data))
    await db.commit()
    await db.refresh(job)
    
    return job


@router.post("/{job_id}/publish", response_model=JobResponse)
async def publish_job(
    request: Request,
    job_id: UUID,
    publish_data: JobPublishRequest,
    current_user: CurrentUser = Depends(get_current_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Publish job to LinkedIn and career page.
    Creates postings and generates URLs.
    """
    if not current_user.has_any_role(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    check_company_access(current_user, job.company_id)
    
    if not job.job_description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot publish job without description"
        )
    
    # Get company details
    company_result = await db.execute(select(Company).where(Company.id == job.company_id))
    company = company_result.scalar_one()
    
    # Generate career page URL
    career_page_url = f"{settings.CAREER_PAGE_BASE_URL}/{job.unique_job_code}"
    job.career_page_url = career_page_url
    
    # Create career page posting record
    career_posting = JobPosting(
        job_id=job.id,
        platform="career_page",
        post_url=career_page_url,
        status="active"
    )
    db.add(career_posting)
    
    # Post to LinkedIn if requested
    if publish_data.post_to_linkedin:
        # Check if LinkedIn organization is configured
        if not company.linkedin_organization_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="LinkedIn organization not configured. Admin must set up LinkedIn company page first."
            )
        
        try:
            linkedin_result = await unipile_service.create_and_publish_linkedin_job(
                db=db,
                company_id=job.company_id,
                job_id=job.id,
                job_title=job.job_title,
                job_description=job.job_description,
                location=job.location,
                employment_type=job.employment_type,
                workplace_type="REMOTE" if job.is_remote else "ON_SITE",
                company_name=company.name,
                application_url=career_page_url,  # Applicants click to apply here
                screening_questions=job.screening_questions,
                use_free_posting=publish_data.use_free_posting if hasattr(publish_data, 'use_free_posting') else True,
                daily_budget=publish_data.daily_budget if hasattr(publish_data, 'daily_budget') else None
            )
            
            if linkedin_result["success"]:
                logger.info(f"LinkedIn job posted successfully for job_id={job.id}, linkedin_job_id={linkedin_result.get('linkedin_job_id')}")
            else:
                # LinkedIn posting failed - log reason but don't block
                logger.warning(f"LinkedIn posting failed for job_id={job.id}: {linkedin_result.get('error')}")
                
        except Exception as e:
            # Log but don't block job publishing
            logger.exception(
                f"LinkedIn posting exception for job_id={job.id}: {str(e)}"
            )

    # Update job status
    job.is_published = True
    job.published_at = datetime.now(timezone.utc)
    job.status = "published"
    
    await db.commit()
    await db.refresh(job)
    
    # Log audit
    ip_address = request.client.host if request.client else None
    await audit_service.log_job_posted(
        db=db,
        user_id=current_user.id,
        company_id=job.company_id,
        job_id=job.id,
        job_title=job.job_title,
        platforms=["career_page", "linkedin"] if publish_data.post_to_linkedin else ["career_page"],
        ip_address=ip_address
    )
    
    return job


@router.get("/{job_id}/token-usage")
async def get_job_token_usage(
    job_id: UUID,
    current_user: CurrentUser = Depends(get_current_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed token usage for a job.
    Shows JD generation tokens + aggregated resume processing tokens.
    """
    if not current_user.has_any_role(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    # Verify job exists and belongs to user's company
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    check_company_access(current_user, job.company_id)
    
    # Get token summary
    token_summary = await credit_service.get_job_token_summary(db, job_id)
    
    return token_summary
