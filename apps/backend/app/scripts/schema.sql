-- Everleap Backend Database Schema
-- PostgreSQL 14+
-- FIXED: Multi-tenant email, proper token tracking, all constraints working

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'HR', 'CANDIDATE');
CREATE TYPE employment_type AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP');
CREATE TYPE application_status AS ENUM ('APPLIED', 'SCREENING', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'OFFERED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');
CREATE TYPE interview_status AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');
CREATE TYPE onboarding_task_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');
CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ROLE_ASSIGNED', 'HIRING_DECISION', 'OVERRIDE', 'JOB_POSTED', 'APPLICATION_SUBMITTED');

-- ===========================================================================
-- COMPANIES TABLE (Multi-tenant root)
-- ===========================================================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    website TEXT,
    linkedin_url TEXT,
    diversity_policy TEXT,
    total_storage_used BIGINT DEFAULT 0, -- in bytes
    api_credits_used INTEGER DEFAULT 0,
    api_credits_limit INTEGER DEFAULT 10000,
    next_invoice_date TIMESTAMP WITH TIME ZONE,
    subscription_tier VARCHAR(50) DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_companies_domain ON companies(domain);
CREATE INDEX idx_companies_active ON companies(is_active) WHERE deleted_at IS NULL;

-- ===========================================================================
-- USERS TABLE (Multi-tenant aware)
-- ===========================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,  -- NOT globally unique - see indexes below
    password_hash VARCHAR(255), -- NULL until password is set
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    is_email_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_password_set BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP WITH TIME ZONE,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Multi-tenant email uniqueness: email is unique PER COMPANY (not globally)
-- This allows same email across different companies (consultants, agencies, shared HR)
CREATE UNIQUE INDEX uq_users_company_email 
ON users(company_id, email) 
WHERE deleted_at IS NULL;

-- For system users (SUPER_ADMIN) without company_id
-- Email must be unique when company_id IS NULL
CREATE UNIQUE INDEX uq_users_system_email 
ON users(email) 
WHERE company_id IS NULL AND deleted_at IS NULL;

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company ON users(company_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_active ON users(is_active) WHERE deleted_at IS NULL;

-- ===========================================================================
-- USER ROLES (Many-to-many with users)
-- ===========================================================================
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- ===========================================================================
-- REFRESH TOKENS
-- ===========================================================================
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token) WHERE revoked_at IS NULL;

-- ===========================================================================
-- JOBS TABLE
-- ===========================================================================
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    job_title VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    employment_type employment_type NOT NULL,
    location VARCHAR(255),
    is_remote BOOLEAN DEFAULT false,
    compensation_min DECIMAL(12, 2),
    compensation_max DECIMAL(12, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    equity TEXT,
    direct_job_post BOOLEAN DEFAULT false,
    job_description TEXT, -- Generated by AI agent
    screening_questions JSONB, -- Array of questions
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    linkedin_job_url TEXT,
    career_page_url TEXT,
    unique_job_code VARCHAR(50) UNIQUE,
    tokens_used INTEGER DEFAULT 0, -- AI credits used for JD generation
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_jobs_company ON jobs(company_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_unique_code ON jobs(unique_job_code);

-- ===========================================================================
-- JOB POSTINGS (tracking where job is posted)
-- ===========================================================================
CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'linkedin', 'career_page', 'indeed', etc.
    external_id VARCHAR(255), -- LinkedIn job ID, etc.
    post_url TEXT,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_job_postings_job ON job_postings(job_id);
CREATE INDEX idx_job_postings_platform ON job_postings(platform);

-- ===========================================================================
-- CANDIDATES TABLE
-- ===========================================================================
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    linkedin_url TEXT,
    portfolio_url TEXT,
    years_of_experience INTEGER,
    current_company VARCHAR(255),
    current_job_role VARCHAR(255),
    skills JSONB, -- Array of skills
    expected_salary_min DECIMAL(12, 2),
    expected_salary_max DECIMAL(12, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    availability_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_candidates_user ON candidates(user_id);

-- ===========================================================================
-- APPLICATIONS TABLE
-- ===========================================================================
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    resume_gcs_path TEXT NOT NULL,
    resume_filename VARCHAR(255) NOT NULL,
    resume_size BIGINT, -- in bytes
    cover_letter TEXT,
    screening_answers JSONB, -- Answers to screening questions
    status application_status DEFAULT 'APPLIED',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(candidate_id, job_id)
);

CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);

-- ===========================================================================
-- RESUME EVALUATIONS (AI screening results)
-- ===========================================================================
CREATE TABLE resume_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    parsed_data JSONB, -- Structured resume data
    ai_score DECIMAL(5, 2), -- 0-100
    ai_summary TEXT,
    strengths JSONB, -- Array of strings
    weaknesses JSONB, -- Array of strings
    recommendation VARCHAR(50), -- 'strong_match', 'potential_match', 'no_match'
    tokens_used INTEGER DEFAULT 0,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    evaluated_by_agent VARCHAR(100) -- Agent name/version
);

CREATE INDEX idx_resume_evaluations_application ON resume_evaluations(application_id);
CREATE INDEX idx_resume_evaluations_score ON resume_evaluations(ai_score);

-- ===========================================================================
-- INTERVIEWS TABLE
-- ===========================================================================
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    scheduled_by UUID REFERENCES users(id),
    interviewer_ids JSONB, -- Array of user IDs
    interview_type VARCHAR(50), -- 'phone_screen', 'technical', 'cultural', 'final'
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    meeting_link TEXT,
    location TEXT,
    notes TEXT,
    status interview_status DEFAULT 'SCHEDULED',
    feedback JSONB, -- Structured feedback from interviewers
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interviews_application ON interviews(application_id);
CREATE INDEX idx_interviews_scheduled_at ON interviews(scheduled_at);
CREATE INDEX idx_interviews_status ON interviews(status);

-- ===========================================================================
-- ONBOARDING TASKS
-- ===========================================================================
CREATE TABLE onboarding_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    task_name VARCHAR(255) NOT NULL,
    task_description TEXT,
    task_order INTEGER,
    assigned_to UUID REFERENCES users(id),
    due_date DATE,
    status onboarding_task_status DEFAULT 'PENDING',
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_onboarding_tasks_application ON onboarding_tasks(application_id);
CREATE INDEX idx_onboarding_tasks_status ON onboarding_tasks(status);
CREATE INDEX idx_onboarding_tasks_assigned ON onboarding_tasks(assigned_to);

-- ===========================================================================
-- AUDIT LOGS
-- ===========================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action audit_action NOT NULL,
    resource_type VARCHAR(100), -- 'user', 'job', 'application', etc.
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_company ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- ===========================================================================
-- CREDIT USAGE TRACKING (FIXED with input/output tokens)
-- ===========================================================================
CREATE TABLE credit_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    operation VARCHAR(100) NOT NULL, -- 'jd_generation', 'resume_parsing', 'resume_screening'
    
    -- Detailed token tracking (FIXED)
    input_tokens INTEGER NOT NULL,  -- Prompt/input tokens from Groq
    output_tokens INTEGER NOT NULL, -- Completion/output tokens from Groq
    total_tokens INTEGER NOT NULL,  -- Total (input + output) from Groq
    
    cost_per_token DECIMAL(10, 8),
    total_cost DECIMAL(10, 4),
    resource_type VARCHAR(50), -- 'job', 'application'
    resource_id UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_credit_usage_company ON credit_usage(company_id);
CREATE INDEX idx_credit_usage_operation ON credit_usage(operation);
CREATE INDEX idx_credit_usage_resource ON credit_usage(resource_type, resource_id);
CREATE INDEX idx_credit_usage_created_at ON credit_usage(created_at);

-- ===========================================================================
-- OAUTH TOKENS (for Unipile/LinkedIn integration)
-- ===========================================================================
CREATE TABLE oauth_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'linkedin', 'unipile'
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type VARCHAR(50),
    expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, provider)
);

CREATE INDEX idx_oauth_tokens_company ON oauth_tokens(company_id);
CREATE INDEX idx_oauth_tokens_provider ON oauth_tokens(provider);

-- ===========================================================================
-- EMAIL TEMPLATES
-- ===========================================================================
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    template_name VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    variables JSONB, -- List of supported variables
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, template_name)
);

CREATE INDEX idx_email_templates_company ON email_templates(company_id);
CREATE INDEX idx_email_templates_name ON email_templates(template_name);

-- ===========================================================================
-- EMAIL QUEUE (for async sending)
-- ===========================================================================
CREATE TABLE email_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    to_email VARCHAR(255) NOT NULL,
    cc_emails JSONB,
    bcc_emails JSONB,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    attachments JSONB,
    priority INTEGER DEFAULT 5, -- 1-10, 10 is highest
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_queue_scheduled ON email_queue(scheduled_at) WHERE sent_at IS NULL AND failed_at IS NULL;
CREATE INDEX idx_email_queue_priority ON email_queue(priority DESC);

-- ===========================================================================
-- FUNCTIONS AND TRIGGERS
-- ===========================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_tasks_updated_at BEFORE UPDATE ON onboarding_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oauth_tokens_updated_at BEFORE UPDATE ON oauth_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Track company storage usage when application is created
CREATE OR REPLACE FUNCTION update_company_storage()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE companies 
        SET total_storage_used = total_storage_used + NEW.resume_size
        WHERE id = (SELECT company_id FROM jobs WHERE id = NEW.job_id);
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE companies 
        SET total_storage_used = GREATEST(0, total_storage_used - OLD.resume_size)
        WHERE id = (SELECT company_id FROM jobs WHERE id = OLD.job_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_company_storage AFTER INSERT OR DELETE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_company_storage();

-- Trigger: Update company credits automatically when credit_usage is inserted (FIXED)
CREATE OR REPLACE FUNCTION update_company_credits()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE companies 
    SET api_credits_used = api_credits_used + NEW.total_tokens
    WHERE id = NEW.company_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_company_credits
AFTER INSERT ON credit_usage
FOR EACH ROW
EXECUTE FUNCTION update_company_credits();

-- Generate unique job code
CREATE OR REPLACE FUNCTION generate_unique_job_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.unique_job_code IS NULL THEN
        NEW.unique_job_code := 'JOB-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
        
        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM jobs WHERE unique_job_code = NEW.unique_job_code) LOOP
            NEW.unique_job_code := 'JOB-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_job_code BEFORE INSERT ON jobs
    FOR EACH ROW EXECUTE FUNCTION generate_unique_job_code();

-- ===========================================================================
-- VIEWS FOR COMMON QUERIES
-- ===========================================================================

-- Active employees per company
CREATE VIEW active_employees_count AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    COUNT(DISTINCT u.id) as total_employees
FROM companies c
LEFT JOIN users u ON u.company_id = c.id 
LEFT JOIN user_roles ur ON ur.user_id = u.id
WHERE u.deleted_at IS NULL 
    AND u.is_active = true
    AND ur.role IN ('ADMIN', 'HR')
GROUP BY c.id, c.name;

-- Job application statistics
CREATE VIEW job_application_stats AS
SELECT 
    j.id as job_id,
    j.job_title,
    j.company_id,
    COUNT(a.id) as total_applications,
    COUNT(CASE WHEN a.status = 'APPLIED' THEN 1 END) as new_applications,
    COUNT(CASE WHEN a.status = 'SCREENING' THEN 1 END) as in_screening,
    COUNT(CASE WHEN a.status = 'INTERVIEW_SCHEDULED' THEN 1 END) as interview_scheduled,
    COUNT(CASE WHEN a.status = 'OFFERED' THEN 1 END) as offers_made,
    COUNT(CASE WHEN a.status = 'ACCEPTED' THEN 1 END) as offers_accepted,
    COUNT(CASE WHEN a.status = 'REJECTED' THEN 1 END) as rejected
FROM jobs j
LEFT JOIN applications a ON a.job_id = j.id
WHERE j.deleted_at IS NULL
GROUP BY j.id, j.job_title, j.company_id;

-- Company dashboard metrics
CREATE VIEW company_dashboard_metrics AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    c.total_storage_used,
    c.api_credits_used,
    c.api_credits_limit,
    c.next_invoice_date,
    (SELECT COUNT(*) FROM users u WHERE u.company_id = c.id AND u.deleted_at IS NULL AND u.is_active = true) as total_employees,
    (SELECT COUNT(*) FROM jobs j WHERE j.company_id = c.id AND j.deleted_at IS NULL) as total_jobs,
    (SELECT COUNT(*) FROM applications a 
     JOIN jobs j ON j.id = a.job_id 
     WHERE j.company_id = c.id) as total_applications
FROM companies c
WHERE c.deleted_at IS NULL;

-- View: Job Token Usage Summary (FIXED - aggregates tokens per job)
CREATE VIEW job_token_summary AS
SELECT 
    j.id AS job_id,
    j.unique_job_code,
    j.job_title,
    j.company_id,
    
    -- JD Generation tokens (single operation per job)
    MAX(CASE WHEN cu.operation = 'jd_generation' THEN cu.input_tokens ELSE 0 END) AS jd_input_tokens,
    MAX(CASE WHEN cu.operation = 'jd_generation' THEN cu.output_tokens ELSE 0 END) AS jd_output_tokens,
    MAX(CASE WHEN cu.operation = 'jd_generation' THEN cu.total_tokens ELSE 0 END) AS jd_total_tokens,
    
    -- Resume Processing tokens (aggregated for all resumes for this job)
    SUM(CASE WHEN cu.operation IN ('resume_parsing', 'resume_screening') THEN cu.input_tokens ELSE 0 END) AS resume_input_tokens,
    SUM(CASE WHEN cu.operation IN ('resume_parsing', 'resume_screening') THEN cu.output_tokens ELSE 0 END) AS resume_output_tokens,
    SUM(CASE WHEN cu.operation IN ('resume_parsing', 'resume_screening') THEN cu.total_tokens ELSE 0 END) AS resume_total_tokens,
    
    -- Total tokens for this job (JD + all resumes)
    MAX(CASE WHEN cu.operation = 'jd_generation' THEN cu.total_tokens ELSE 0 END) +
    COALESCE(SUM(CASE WHEN cu.operation IN ('resume_parsing', 'resume_screening') THEN cu.total_tokens ELSE 0 END), 0) AS total_tokens_for_job,
    
    -- Resume count
    COUNT(DISTINCT CASE 
        WHEN cu.operation IN ('resume_parsing', 'resume_screening') 
        AND cu.resource_type = 'application' 
        THEN cu.resource_id 
    END) AS resume_count,
    
    -- Total cost
    SUM(cu.total_cost) AS total_cost
FROM jobs j
LEFT JOIN credit_usage cu ON 
    (cu.resource_type = 'job' AND cu.resource_id = j.id) OR
    (cu.resource_type = 'application' AND cu.resource_id IN (
        SELECT id FROM applications WHERE job_id = j.id
    ))
GROUP BY j.id, j.unique_job_code, j.job_title, j.company_id;

-- View: Application Token Summary (individual resume processing)
CREATE VIEW application_token_summary AS
SELECT 
    a.id AS application_id,
    a.job_id,
    a.candidate_id,
    j.job_title,
    j.company_id,
    
    -- Resume parsing tokens
    SUM(CASE WHEN cu.operation = 'resume_parsing' THEN cu.input_tokens ELSE 0 END) AS parsing_input_tokens,
    SUM(CASE WHEN cu.operation = 'resume_parsing' THEN cu.output_tokens ELSE 0 END) AS parsing_output_tokens,
    SUM(CASE WHEN cu.operation = 'resume_parsing' THEN cu.total_tokens ELSE 0 END) AS parsing_total_tokens,
    
    -- Resume screening tokens
    SUM(CASE WHEN cu.operation = 'resume_screening' THEN cu.input_tokens ELSE 0 END) AS screening_input_tokens,
    SUM(CASE WHEN cu.operation = 'resume_screening' THEN cu.output_tokens ELSE 0 END) AS screening_output_tokens,
    SUM(CASE WHEN cu.operation = 'resume_screening' THEN cu.total_tokens ELSE 0 END) AS screening_total_tokens,
    
    -- Total for this application
    SUM(cu.input_tokens) AS total_input_tokens,
    SUM(cu.output_tokens) AS total_output_tokens,
    SUM(cu.total_tokens) AS total_tokens,
    
    SUM(cu.total_cost) AS total_cost
FROM applications a
JOIN jobs j ON j.id = a.job_id
LEFT JOIN credit_usage cu ON cu.resource_type = 'application' AND cu.resource_id = a.id
GROUP BY a.id, a.job_id, a.candidate_id, j.job_title, j.company_id;

-- ===========================================================================
-- SEED DATA
-- ===========================================================================

-- Insert default diversity policy
INSERT INTO companies (id, name, domain, diversity_policy, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'System Default',
    'system.default',
    'We are an equal opportunity employer and value diversity. We do not discriminate on the basis of race, religion, color, national origin, gender, sexual orientation, age, marital status, veteran status, or disability status.',
    false
) ON CONFLICT DO NOTHING;

-- Insert default email templates with Everleap branding and logo
INSERT INTO email_templates (company_id, template_name, subject, body_html, body_text, is_system, variables)
VALUES
(
    '00000000-0000-0000-0000-000000000000',
    'email_verification',
    'Verify Your Email - {{company_name}}',
    '<div style="background-color: #f8fafc; font-family: ui-sans-serif, system-ui, sans-serif; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center; margin-bottom: 32px;">
       <img src="{{logo_url}}" alt="Everleap" style="height: 40px; width: auto;" />
    </div>
    <h1 style="color: #0f172a; font-size: 24px; font-weight: 600; margin-bottom: 24px; text-align: center;">Verify Your Email</h1>
    <p style="color: #334155; font-size: 16px; line-height: 24px; margin-bottom: 24px;">Hi {{user_name}},</p>
    <p style="color: #334155; font-size: 16px; line-height: 24px; margin-bottom: 32px;">Thank you for registering with <strong>{{company_name}}</strong>. Please verify your email address to complete your registration.</p>
    <div style="text-align: center; margin-bottom: 32px;">
      <a href="{{verification_link}}" style="background-color: #06bfb3; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Verify Email</a>
    </div>
    <p style="color: #64748b; font-size: 14px; line-height: 20px; margin-bottom: 0;">This link will expire in 24 hours. If you did not create an account, please ignore this email.</p>
  </div>
  <div style="text-align: center; margin-top: 24px; color: #64748b; font-size: 12px;">
      &copy; 2026 {{company_name}}. All rights reserved.
  </div>
</div>',
    'Hi {{user_name}}, Please verify your email address for {{company_name}}. Visit: {{verification_link}}',
    true,
    '["company_name", "user_name", "verification_link", "logo_url"]'::jsonb
),
(
    '00000000-0000-0000-0000-000000000000',
    'password_reset',
    'Reset Your Password - {{company_name}}',
    '<div style="background-color: #f8fafc; font-family: ui-sans-serif, system-ui, sans-serif; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center; margin-bottom: 32px;">
       <img src="{{logo_url}}" alt="Everleap" style="height: 40px; width: auto;" />
    </div>
    <h1 style="color: #0f172a; font-size: 24px; font-weight: 600; margin-bottom: 24px; text-align: center;">Reset Your Password</h1>
    <p style="color: #334155; font-size: 16px; line-height: 24px; margin-bottom: 24px;">Hi {{user_name}},</p>
    <p style="color: #334155; font-size: 16px; line-height: 24px; margin-bottom: 32px;">We received a request to reset your password for your <strong>{{company_name}}</strong> account.</p>
    <div style="text-align: center; margin-bottom: 32px;">
      <a href="{{reset_link}}" style="background-color: #06bfb3; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Reset Password</a>
    </div>
    <p style="color: #64748b; font-size: 14px; line-height: 20px; margin-bottom: 0;">This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
  </div>
  <div style="text-align: center; margin-top: 24px; color: #64748b; font-size: 12px;">
      &copy; 2026 {{company_name}}. All rights reserved.
  </div>
</div>',
    'Hi {{user_name}}, Reset your password for {{company_name}}. Visit: {{reset_link}}',
    true,
    '["company_name", "user_name", "reset_link", "logo_url"]'::jsonb
),
(
    '00000000-0000-0000-0000-000000000000',
    'welcome_email',
    'Welcome to {{company_name}}!',
    '<div style="background-color: #f8fafc; font-family: ui-sans-serif, system-ui, sans-serif; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center; margin-bottom: 32px;">
       <img src="{{logo_url}}" alt="Everleap" style="height: 40px; width: auto;" />
    </div>
    <h1 style="color: #0f172a; font-size: 24px; font-weight: 600; margin-bottom: 24px; text-align: center;">Welcome to {{company_name}}!</h1>
    <p style="color: #334155; font-size: 16px; line-height: 24px; margin-bottom: 24px;">Hi {{user_name}},</p>
    <p style="color: #334155; font-size: 16px; line-height: 24px; margin-bottom: 32px;">You have been invited to join <strong>{{company_name}}</strong> on Everleap. We are excited to have you on board.</p>
    <div style="text-align: center; margin-bottom: 32px;">
      <a href="{{activation_link}}" style="background-color: #06bfb3; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Activate Account</a>
    </div>
    <p style="color: #334155; font-size: 16px; line-height: 24px; margin-bottom: 0;">Please click the button above to set your password and get started.</p>
  </div>
  <div style="text-align: center; margin-top: 24px; color: #64748b; font-size: 12px;">
      &copy; 2026 {{company_name}}. All rights reserved.
  </div>
</div>',
    'Welcome {{user_name}}! You have been invited to join {{company_name}} on Everleap. Please visit: {{activation_link}} to activate your account.',
    true,
    '["company_name", "user_name", "activation_link", "logo_url"]'::jsonb
),
(
    '00000000-0000-0000-0000-000000000000',
    'application_received',
    'Application Received - {{job_title}}',
    '<div style="background-color: #f8fafc; font-family: ui-sans-serif, system-ui, sans-serif; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
     <div style="text-align: center; margin-bottom: 32px;">
       <img src="{{logo_url}}" alt="{{company_name}}" style="height: 40px; width: auto;" />
    </div>
    <h2 style="color: #0f172a; font-size: 20px; font-weight: 600; margin-bottom: 16px;">Application Received</h2>
    <p style="color: #334155; font-size: 16px; line-height: 24px; margin-bottom: 16px;">Hi {{candidate_name}},</p>
    <p style="color: #334155; font-size: 16px; line-height: 24px; margin-bottom: 24px;">Thank you for applying for the <strong>{{job_title}}</strong> position at {{company_name}}. We have received your application and will review it shortly.</p>
    <p style="color: #334155; font-size: 16px; line-height: 24px; margin-bottom: 0;">We will be in touch with next steps.</p>
  </div>
  <div style="text-align: center; margin-top: 24px; color: #64748b; font-size: 12px;">
      &copy; 2026 {{company_name}}. All rights reserved.
  </div>
</div>',
    'Thank you for your application! Hi {{candidate_name}}, We have received your application for {{job_title}} at {{company_name}}. Our team will review your application and get back to you soon.',
    true,
    '["candidate_name", "job_title", "company_name", "logo_url"]'::jsonb
),
(
    '00000000-0000-0000-0000-000000000000',
    'interview_scheduled',
    'Interview Scheduled - {{job_title}}',
    '<div style="background-color: #f8fafc; font-family: ui-sans-serif, system-ui, sans-serif; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
     <div style="text-align: center; margin-bottom: 32px;">
       <img src="{{logo_url}}" alt="{{company_name}}" style="height: 40px; width: auto;" />
    </div>
    <h2 style="color: #0f172a; font-size: 20px; font-weight: 600; margin-bottom: 16px;">Interview Scheduled</h2>
    <p style="color: #334155; font-size: 16px; line-height: 24px; margin-bottom: 24px;">Hi {{candidate_name}},</p>
    <p style="color: #334155; font-size: 16px; line-height: 24px; margin-bottom: 24px;">Great news! We would like to invite you for an interview for the <strong>{{job_title}}</strong> position.</p>
    <div style="background-color: #f1f5f9; padding: 24px; border-radius: 6px; margin-bottom: 32px;">
      <p style="margin: 0 0 12px 0; color: #334155; font-size: 15px;"><strong>Date & Time:</strong> {{interview_datetime}}</p>
      <p style="margin: 0 0 24px 0; color: #334155; font-size: 15px;"><strong>Duration:</strong> {{duration}} minutes</p>
      <div style="text-align: center;">
          <a href="{{meeting_link}}" style="background-color: #06bfb3; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Join Interview</a>
      </div>
    </div>
     <p style="color: #334155; font-size: 16px; line-height: 24px; margin-bottom: 0;">Looking forward to speaking with you!</p>
  </div>
  <div style="text-align: center; margin-top: 24px; color: #64748b; font-size: 12px;">
      &copy; 2026 {{company_name}}. All rights reserved.
  </div>
</div>',
    'Hi {{candidate_name}}, Great news! We would like to invite you for an interview for {{job_title}}. Date & Time: {{interview_datetime}}, Duration: {{duration}} minutes, Meeting Link: {{meeting_link}}',
    true,
    '["candidate_name", "job_title", "interview_datetime", "duration", "meeting_link", "company_name", "logo_url"]'::jsonb
) ON CONFLICT DO NOTHING;

-- Create indexes for full-text search
CREATE INDEX idx_jobs_fulltext ON jobs USING gin(to_tsvector('english', COALESCE(job_description, '')));
CREATE INDEX idx_users_fulltext ON users USING gin(to_tsvector('english', full_name || ' ' || email));

COMMENT ON DATABASE everleap IS 'Everleap - Lean Autonomous HR Swarm';
