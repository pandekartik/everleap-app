"""
Candidates API for HR to view parsed resumes.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.rbac import CurrentUser, UserRole, get_current_verified_user
from db.session import get_db
from models import Application, Job, ResumeEvaluation


router = APIRouter(prefix="/candidates", tags=["Candidates"])


@router.get("")
async def list_candidates(
    current_user: CurrentUser = Depends(get_current_verified_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all parsed resumes for company jobs (HR, ADMIN).
    """
    if not current_user.has_any_role(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    
    # Get all applications for company jobs
    query = select(Application, ResumeEvaluation, Job).join(
        Job, Application.job_id == Job.id
    ).outerjoin(
        ResumeEvaluation, ResumeEvaluation.application_id == Application.id
    ).where(
        Job.company_id == current_user.company_id
    ).order_by(Application.applied_at.desc())
    
    result = await db.execute(query)
    rows = result.all()
    
    candidates = []
    for app, evaluation, job in rows:
        candidates.append({
            "application_id": str(app.id),
            "job_id": str(job.id),
            "job_title": job.job_title,
            "resume_filename": app.resume_filename,
            "applied_at": app.applied_at.isoformat(),
            "status": app.status,
            "ai_score": float(evaluation.ai_score) if evaluation and evaluation.ai_score else None,
            "recommendation": evaluation.recommendation if evaluation else None,
            "parsed_data": evaluation.parsed_data if evaluation else None
        })
    
    return {"candidates": candidates, "total": len(candidates)}
