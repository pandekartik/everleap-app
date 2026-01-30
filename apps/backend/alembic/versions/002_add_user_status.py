"""Add user status column

Revision ID: 002_add_user_status
Revises: 001_add_linkedin_columns
Create Date: 2026-01-30

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002_add_user_status'
down_revision = '001_add_linkedin_columns'
branch_labels = None
depends_on = None


def upgrade():
    # Create enum type
    op.execute("CREATE TYPE user_status AS ENUM ('INVITED', 'ACTIVE', 'DELETED')")
    
    # Add status column with default value
    op.add_column('users', sa.Column('status', sa.Enum('INVITED', 'ACTIVE', 'DELETED', 
                  name='user_status'), server_default='INVITED', nullable=True))
    
    # Backfill existing users based on current state
    op.execute("""
        UPDATE users SET status = 
            CASE 
                WHEN deleted_at IS NOT NULL THEN 'DELETED'::user_status
                WHEN is_password_set = true THEN 'ACTIVE'::user_status
                ELSE 'INVITED'::user_status
            END
    """)


def downgrade():
    op.drop_column('users', 'status')
    op.execute("DROP TYPE user_status")
