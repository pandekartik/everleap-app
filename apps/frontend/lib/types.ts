/**
 * TypeScript types matching backend API schemas
 */

// ============================================================================
// JOB TYPES
// ============================================================================

export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
export type JobStatus = "draft" | "published" | "draft_error" | "closed" | "paused";

export interface Job {
    id: string; // UUID
    company_id: string;
    job_title: string;
    department: string;
    employment_type: EmploymentType;
    location: string;
    is_remote: boolean;
    compensation_min: number | null;
    compensation_max: number | null;
    currency: string;
    equity: string | null;
    job_description: string | null;
    screening_questions: any | null;
    unique_job_code: string; // e.g., "JOB-166600"
    is_published: boolean;
    published_at: string | null;
    career_page_url: string | null;
    linkedin_job_id: string | null;
    linkedin_url: string | null;
    status: JobStatus;
    tokens_used: number | null;
    created_at: string;
    created_by: string; // UUID
    direct_job_post: boolean;
}

export interface JobListItem {
    id: string;
    job_title: string;
    department: string;
    employment_type: EmploymentType;
    location: string;
    is_remote: boolean;
    compensation_min: number | null;
    compensation_max: number | null;
    currency: string;
    is_published: boolean;
    published_at: string | null;
    unique_job_code: string;
    status: JobStatus;
    total_applications: number;
    created_at: string;
}

export interface PaginatedJobResponse {
    items: JobListItem[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface JobCreateRequest {
    job_title: string;
    department: string;
    employment_type: EmploymentType;
    location: string;
    is_remote: boolean;
    compensation_min?: number;
    compensation_max?: number;
    currency: string;
    equity?: string;
    direct_job_post: boolean;
    screening_questions?: any;
}

export interface JobPublishRequest {
    post_to_linkedin: boolean;
}

// ============================================================================
// CANDIDATE/APPLICATION TYPES
// ============================================================================

export type ApplicationStatus =
    | "APPLIED"
    | "SCREENING"
    | "INTERVIEW_SCHEDULED"
    | "INTERVIEWED"
    | "OFFERED"
    | "ACCEPTED"
    | "REJECTED"
    | "WITHDRAWN";

export type AIRecommendation = "STRONG_MATCH" | "POTENTIAL_MATCH" | "WEAK_MATCH";

export interface ParsedResumeData {
    name: string;
    email: string;
    phone?: string;
    skills: string[];
    experience: any[];
    education: any[];
    summary?: string;
}

export interface CandidateApplication {
    application_id: string;
    job_id: string;
    job_title: string;
    resume_filename: string;
    applied_at: string;
    status: ApplicationStatus;
    ai_score: number | null; // 0-100
    recommendation: AIRecommendation | null;
    parsed_data: ParsedResumeData | null;
}

export interface CandidatesResponse {
    candidates: CandidateApplication[];
    total: number;
}

export interface ApplicationUpdateRequest {
    status: ApplicationStatus;
}

// ============================================================================
// COMPANY/DASHBOARD TYPES
// ============================================================================

export interface CompanyDashboardMetrics {
    total_employees: number;
    total_jobs: number;
    total_applications: number;
    api_credits_used: number;
    api_credits_limit: number;
    total_storage_used: number;
    next_invoice_date: string | null;
}

export interface UserListItem {
    id: string;
    email: string;
    full_name: string;
    roles: string[];
    is_email_verified: boolean;
    created_at: string;
}

export interface PaginatedUserResponse {
    items: UserListItem[];
    total: number;
    page: number;
    page_size: number;
}

// ============================================================================
// LINKEDIN TYPES
// ============================================================================

export interface LinkedInStatus {
    connected: boolean;
    account_id: string | null;
    profile: {
        name: string;
        email: string;
    } | null;
    expires_at: string | null;
}

export interface LinkedInOrganization {
    id: string;
    name: string;
    vanity_name: string;
}

export interface LinkedInOrganizationsResponse {
    organizations: LinkedInOrganization[];
    count: number;
}
