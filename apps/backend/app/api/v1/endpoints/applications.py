"""
Applications API - Resume upload, parsing, and screening.
"""
import json
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from agents.resume_parser import resume_parser_agent
from agents.resume_screener import resume_screener_agent
from core.config import settings
from core.rbac import CurrentUser, UserRole, get_current_verified_user
from db.session import get_db
from models import Application, Candidate, Job, ResumeEvaluation, User, Company
from schemas.application import ApplicationCreate, ApplicationResponse, ApplicationUpdateStatus
from services.audit import audit_service
from services.credit import credit_service
from services.email import email_service
from services.storage import gcs_service


router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def submit_application(
    job_id: str,  # Can be UUID or unique_job_code (e.g., JOB-166600)
    resume: UploadFile = File(...),
    cover_letter: str = None,
    current_user: CurrentUser = Depends(get_current_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Submit job application with resume upload (CANDIDATE).
    Automatically parses and screens resume using AI.
    
    job_id can be either:
    - A UUID (e.g., "360adfe3-6c92-496e-89b2-c56e93dbff6b")
    - A job code (e.g., "JOB-166600")
    """
    if not current_user.is_candidate:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only candidates can submit applications"
        )
    
    # Validate file
    if not resume.filename.lower().endswith(('.pdf', '.doc', '.docx')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF, DOC, DOCX files allowed"
        )
    
    # Read file
    resume_content = await resume.read()
    
    if len(resume_content) > settings.max_upload_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE_MB}MB"
        )
    
    # Get job by UUID or job code
    try:
        # Try as UUID first
        job_uuid = UUID(job_id)
        job_result = await db.execute(select(Job).where(Job.id == job_uuid))
    except ValueError:
        # If not a valid UUID, try as job code
        job_result = await db.execute(select(Job).where(Job.unique_job_code == job_id))
    
    job = job_result.scalar_one_or_none()
    
    if not job or not job.is_published:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found or not published")
    
    # Get or create candidate profile
    candidate_result = await db.execute(
        select(Candidate).where(Candidate.user_id == current_user.id)
    )
    candidate = candidate_result.scalar_one_or_none()
    
    if not candidate:
        candidate = Candidate(user_id=current_user.id)
        db.add(candidate)
        await db.flush()
    
    # Check for duplicate application
    existing = await db.execute(
        select(Application).where(
            Application.candidate_id == candidate.id,
            Application.job_id == job.id  # Use job.id (UUID), not job_id (string)
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already applied to this job"
        )
    
    # Upload resume to GCS
    gcs_path = await gcs_service.upload_resume(
        file_content=resume_content,
        company_id=job.company_id,
        job_id=job.id,
        candidate_id=candidate.id,
        filename=resume.filename,
        content_type=resume.content_type
    )
    
    # Create application
    application = Application(
        candidate_id=candidate.id,
        job_id=job.id,
        resume_gcs_path=gcs_path,
        resume_filename=resume.filename,
        resume_size=len(resume_content),
        cover_letter=cover_letter,
        status="APPLIED"
    )
    db.add(application)
    await db.flush()
    
    # Parse resume with AI
    try:
        parse_result = await resume_parser_agent.execute(
            input_data="",
            metadata={"pdf_bytes": resume_content}
        )
        
        if parse_result.success:
            parsed_data = json.loads(parse_result.output)
            
            # Track resume parsing tokens
            await credit_service.track_resume_parsing(
                db=db,
                company_id=job.company_id,
                user_id=None,
                application_id=application.id,
                input_tokens=parse_result.input_tokens,
                output_tokens=parse_result.output_tokens
            )
            
            # Screen resume
            screen_input = json.dumps({
                "parsed_resume": parsed_data,
                "job_description": job.job_description,
                "job_title": job.job_title
            })
            
            screen_result = await resume_screener_agent.execute(screen_input)
            
            if screen_result.success:
                screen_data = json.loads(screen_result.output)
                
                # Create evaluation
                evaluation = ResumeEvaluation(
                    application_id=application.id,
                    parsed_data=parsed_data,
                    ai_score=screen_data.get("score"),
                    ai_summary=screen_data.get("summary"),
                    strengths=screen_data.get("strengths"),
                    weaknesses=screen_data.get("weaknesses"),
                    recommendation=screen_data.get("recommendation"),
                    tokens_used=parse_result.total_tokens + screen_result.total_tokens,
                    evaluated_by_agent="resume_screener_v1"
                )
                db.add(evaluation)
                
                # Track resume screening tokens
                await credit_service.track_resume_screening(
                    db=db,
                    company_id=job.company_id,
                    user_id=None,
                    application_id=application.id,
                    input_tokens=screen_result.input_tokens,
                    output_tokens=screen_result.output_tokens
                )
    except Exception as e:
        # Log the error instead of silently ignoring
        import logging
        logging.error(f"Resume parsing/screening failed: {str(e)}", exc_info=True)
    
    await db.commit()
    await db.refresh(application)
    
    # Send confirmation email
    user_result = await db.execute(select(User).where(User.id == current_user.id))
    user = user_result.scalar_one()
    
    company_result = await db.execute(select(Company).where(Company.id == job.company_id))
    company = company_result.scalar_one()
    
    await email_service.send_application_received_email(
        to_email=user.email,
        candidate_name=user.full_name,
        job_title=job.job_title,
        company_name=company.name
    )
    
    return application


@router.patch("/{application_id}/status", response_model=ApplicationResponse)
async def update_application_status(
    application_id: UUID,
    status_update: ApplicationUpdateStatus,
    current_user: CurrentUser = Depends(get_current_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """Update application status (HR, ADMIN)."""
    if not current_user.has_any_role(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    result = await db.execute(select(Application).where(Application.id == application_id))
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    old_status = application.status
    await db.execute(
        update(Application).where(Application.id == application_id).values(
            status=status_update.status
        )
    )
    await db.commit()
    await db.refresh(application)
    
    # Log hiring decision
    await audit_service.log_hiring_decision(
        db=db,
        user_id=current_user.id,
        company_id=current_user.company_id,
        application_id=application.id,
        old_status=old_status,
        new_status=status_update.status
    )
    
    return application
