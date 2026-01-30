"""Add LinkedIn job columns to jobs table and organization columns to companies table

Revision ID: 001_add_linkedin_columns
Revises: 
Create Date: 2026-01-29
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001_add_linkedin_columns'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """Add linkedin columns to jobs and companies tables."""
    # Jobs table - LinkedIn posting details
    op.add_column('jobs', sa.Column('linkedin_job_id', sa.String(255), nullable=True))
    op.add_column('jobs', sa.Column('linkedin_posted_at', sa.DateTime(timezone=True), nullable=True))
    
    # Companies table - Admin-configured LinkedIn organization
    op.add_column('companies', sa.Column('linkedin_organization_id', sa.String(255), nullable=True))
    op.add_column('companies', sa.Column('linkedin_organization_name', sa.String(255), nullable=True))


def downgrade():
    """Remove linkedin columns from jobs and companies tables."""
    op.drop_column('jobs', 'linkedin_posted_at')
    op.drop_column('jobs', 'linkedin_job_id')
    op.drop_column('companies', 'linkedin_organization_name')
    op.drop_column('companies', 'linkedin_organization_id')
