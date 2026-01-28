# EVERLEAP API DOCUMENTATION
# Complete list of all 26 API endpoints with example payloads

BASE_URL: http://localhost:8000
API_PREFIX: /api/v1

## ===========================================================================
## AUTHENTICATION ENDPOINTS (9)
## ===========================================================================

### 1. REGISTER (Candidate)
POST /api/v1/auth/register

Request:
```json
{
  "email": "candidate@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
```

Response (201):
```json
{
  "id": "uuid",
  "email": "candidate@example.com",
  "full_name": "John Doe",
  "is_verified": false,
  "created_at": "2026-01-24T10:00:00Z"
}
```

---

### 2. LOGIN
POST /api/v1/auth/login

Request:
```json
{
  "email": "contact@everleap.in",
  "password": "Everleap@0313"
}
```

Response (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "contact@everleap.in",
    "full_name": "Super Administrator",
    "roles": ["SUPER_ADMIN"]
  }
}
```

**Test Users:**
- SUPER ADMIN: contact@everleap.in / Everleap@2026
- ADMIN: admin@demo.company / DemoAdmin123!

---

### 3. REFRESH TOKEN
POST /api/v1/auth/refresh

Request:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Response (200):
```json
{
  "access_token": "new_access_token...",
  "refresh_token": "new_refresh_token...",
  "token_type": "bearer"
}
```

---

### 4. GET CURRENT USER
GET /api/v1/auth/me
Headers: Authorization: Bearer {access_token}

Response (200):
```json
{
  "id": "uuid",
  "email": "contact@everleap.in",
  "full_name": "Super Administrator",
  "company_id": "uuid",
  "roles": ["SUPER_ADMIN"],
  "is_verified": true,
  "is_active": true,
  "created_at": "2026-01-24T10:00:00Z"
}
```

---

### 5. LOGOUT
POST /api/v1/auth/logout
Headers: Authorization: Bearer {access_token}

Request:
```json
{
  "refresh_token": "your_refresh_token"
}
```

Response (200):
```json
{
  "message": "Successfully logged out"
}
```

---

### 6. VERIFY EMAIL
POST /api/v1/auth/verify-email

Request:
```json
{
  "token": "verification_token_from_email"
}
```

Response (200):
```json
{
  "message": "Email verified successfully"
}
```

---

### 7. REQUEST PASSWORD RESET
POST /api/v1/auth/request-password-reset

Request:
```json
{
  "email": "user@example.com"
}
```

Response (200):
```json
{
  "message": "Password reset email sent"
}
```

---

### 8. RESET PASSWORD
POST /api/v1/auth/reset-password

Request:
```json
{
  "token": "reset_token_from_email",
  "new_password": "NewSecurePass123!"
}
```

Response (200):
```json
{
  "message": "Password reset successfully"
}
```

---

### 9. SET PASSWORD (Invited Users)
POST /api/v1/auth/set-password

Request:
```json
{
  "token": "invitation_token_from_email",
  "password": "NewPassword123!"
}
```

Response (200):
```json
{
  "message": "Password set successfully"
}
```

---

## ===========================================================================
## COMPANY MANAGEMENT ENDPOINTS (8)
## ===========================================================================

### 10. CREATE COMPANY (SUPER_ADMIN only)
POST /api/v1/companies
Headers: Authorization: Bearer {super_admin_token}

Request:
```json
{
  "name": "TechCorp Inc",
  "domain": "techcorp.com",
  "subscription_tier": "premium",
  "api_credits_limit": 50000,
  "diversity_policy": "We are an equal opportunity employer."
}
```

Response (201):
```json
{
  "id": "uuid",
  "name": "TechCorp Inc",
  "domain": "techcorp.com",
  "subscription_tier": "premium",
  "api_credits_limit": 50000,
  "api_credits_used": 0,
  "created_at": "2026-01-24T10:00:00Z"
}
```

---

### 11. LIST ALL COMPANIES (SUPER_ADMIN only)
GET /api/v1/companies
Headers: Authorization: Bearer {super_admin_token}

Response (200):
```json
{
  "companies": [
    {
      "id": "uuid",
      "name": "Everleap Technologies",
      "domain": "everleap.in",
      "subscription_tier": "premium",
      "api_credits_used": 2500,
      "api_credits_limit": 100000,
      "created_at": "2026-01-24T10:00:00Z"
    }
  ],
  "total": 1
}
```

---

### 12. GET COMPANY DETAILS
GET /api/v1/companies/{company_id}
Headers: Authorization: Bearer {token}

Response (200):
```json
{
  "id": "uuid",
  "name": "Everleap Technologies",
  "domain": "everleap.in",
  "subscription_tier": "premium",
  "api_credits_limit": 100000,
  "api_credits_used": 2500,
  "diversity_policy": "We are an equal opportunity employer.",
  "created_at": "2026-01-24T10:00:00Z"
}
```

---

### 13. UPDATE COMPANY (ADMIN)
PATCH /api/v1/companies/{company_id}
Headers: Authorization: Bearer {admin_token}

Request:
```json
{
  "diversity_policy": "Updated diversity and inclusion policy...",
  "api_credits_limit": 150000
}
```

Response (200):
```json
{
  "id": "uuid",
  "name": "Everleap Technologies",
  "api_credits_limit": 150000,
  "updated_at": "2026-01-24T11:00:00Z"
}
```

---

### 14. GET COMPANY DASHBOARD (ADMIN)
GET /api/v1/companies/{company_id}/dashboard
Headers: Authorization: Bearer {admin_token}

Response (200):
```json
{
  "company_id": "uuid",
  "total_employees": 5,
  "total_storage_bytes": 15728640,
  "storage_used_mb": 15.0,
  "api_credits_used": 2500,
  "api_credits_limit": 100000,
  "credits_remaining": 97500,
  "next_invoice_date": "2026-02-01",
  "total_jobs": 10,
  "published_jobs": 7,
  "total_applications": 45
}
```

---

### 15. ADD USER TO COMPANY (ADMIN)
POST /api/v1/companies/{company_id}/users
Headers: Authorization: Bearer {admin_token}

Request:
```json
{
  "email": "newhr@company.com",
  "full_name": "Jane Smith",
  "role": "HR"
}
```

Response (201):
```json
{
  "id": "uuid",
  "email": "newhr@company.com",
  "full_name": "Jane Smith",
  "company_id": "uuid",
  "roles": ["HR"],
  "invitation_sent": true
}
```

---

### 16. LIST COMPANY USERS (Paginated)
GET /api/v1/companies/{company_id}/users?page=1&page_size=25
Headers: Authorization: Bearer {admin_token}

Response (200):
```json
{
  "items": [
    {
      "id": "uuid",
      "email": "contact@everleap.in",
      "full_name": "Super Administrator",
      "roles": ["SUPER_ADMIN"],
      "is_active": true,
      "created_at": "2026-01-24T10:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "page_size": 25,
  "total_pages": 1
}
```

---

### 17. UPDATE USER (ADMIN)
PATCH /api/v1/companies/{company_id}/users/{user_id}
Headers: Authorization: Bearer {admin_token}

Request:
```json
{
  "full_name": "Jane Smith Updated",
  "is_active": true
}
```

Response (200):
```json
{
  "id": "uuid",
  "email": "newhr@company.com",
  "full_name": "Jane Smith Updated",
  "is_active": true,
  "updated_at": "2026-01-24T11:00:00Z"
}
```

---

## ===========================================================================
## JOB MANAGEMENT ENDPOINTS (6)
## ===========================================================================

### 18. CREATE JOB (HR, ADMIN)
POST /api/v1/jobs
Headers: Authorization: Bearer {hr_token}

**Option 1: With AI Generation (direct_job_post=false)**
```json
{
  "job_title": "Senior Backend Engineer",
  "department": "Engineering",
  "employment_type": "FULL_TIME",
  "location": "San Francisco, CA",
  "is_remote": true,
  "compensation_min": 150000,
  "compensation_max": 200000,
  "currency": "USD",
  "equity": "0.1% - 0.5%",
  "direct_job_post": false
}
```

**Option 2: Direct Post (direct_job_post=true)**
```json
{
  "job_title": "Senior Backend Engineer",
  "department": "Engineering",
  "employment_type": "FULL_TIME",
  "location": "San Francisco, CA",
  "is_remote": true,
  "compensation_min": 150000,
  "compensation_max": 200000,
  "currency": "USD",
  "equity": "0.1% - 0.5%",
  "direct_job_post": true,
  "job_description": "Your manually written job description here...",
  "screening_questions": [
    {"question": "Why are you interested?", "required": true, "order": 1}
  ]
}
```

Response (201):
```json
{
  "id": "uuid",
  "unique_job_code": "JOB-ABC123",
  "job_title": "Senior Backend Engineer",
  "department": "Engineering",
  "employment_type": "FULL_TIME",
  "location": "San Francisco, CA",
  "is_remote": true,
  "compensation_min": 150000,
  "compensation_max": 200000,
  "currency": "USD",
  "job_description": "AI-generated or manual description...",
  "screening_questions": [...],
  "tokens_used": 2100,
  "status": "draft",
  "is_published": false,
  "created_at": "2026-01-24T10:00:00Z"
}
```

---

### 19. LIST JOBS (Paginated)
GET /api/v1/jobs?page=1&page_size=25&status=published
Headers: Authorization: Bearer {hr_token}

Response (200):
```json
{
  "items": [
    {
      "id": "uuid",
      "job_title": "Senior Backend Engineer",
      "department": "Engineering",
      "employment_type": "FULL_TIME",
      "location": "San Francisco, CA",
      "is_remote": true,
      "compensation_min": 150000,
      "compensation_max": 200000,
      "is_published": true,
      "unique_job_code": "JOB-ABC123",
      "status": "published",
      "total_applications": 25,
      "created_at": "2026-01-24T10:00:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "page_size": 25,
  "total_pages": 1
}
```

---

### 20. GET JOB DETAILS
GET /api/v1/jobs/{job_id}
Headers: Authorization: Bearer {hr_token}

Response (200):
```json
{
  "id": "uuid",
  "unique_job_code": "JOB-ABC123",
  "job_title": "Senior Backend Engineer",
  "department": "Engineering",
  "employment_type": "FULL_TIME",
  "location": "San Francisco, CA",
  "is_remote": true,
  "compensation_min": 150000,
  "compensation_max": 200000,
  "currency": "USD",
  "equity": "0.1% - 0.5%",
  "job_description": "Full job description...",
  "screening_questions": [...],
  "tokens_used": 2100,
  "status": "published",
  "is_published": true,
  "published_at": "2026-01-24T10:30:00Z",
  "career_page_url": "https://everleap.in/jobs/JOB-ABC123",
  "linkedin_job_url": "https://linkedin.com/jobs/...",
  "created_at": "2026-01-24T10:00:00Z"
}
```

---

### 21. UPDATE JOB
PATCH /api/v1/jobs/{job_id}
Headers: Authorization: Bearer {hr_token}

Request:
```json
{
  "job_description": "Updated job description...",
  "compensation_max": 220000
}
```

Response (200):
```json
{
  "id": "uuid",
  "job_title": "Senior Backend Engineer",
  "compensation_max": 220000,
  "updated_at": "2026-01-24T11:00:00Z"
}
```

---

### 22. PUBLISH JOB (LinkedIn + Career Page)
POST /api/v1/jobs/{job_id}/publish
Headers: Authorization: Bearer {hr_token}

Request:
```json
{
  "post_to_linkedin": true,
  "post_to_career_page": true
}
```

Response (200):
```json
{
  "id": "uuid",
  "is_published": true,
  "published_at": "2026-01-24T11:00:00Z",
  "career_page_url": "https://everleap.in/jobs/JOB-ABC123",
  "linkedin_job_url": "https://linkedin.com/jobs/view/123456",
  "status": "published"
}
```

---

### 23. GET JOB TOKEN USAGE
GET /api/v1/jobs/{job_id}/token-usage
Headers: Authorization: Bearer {hr_token}

Response (200):
```json
{
  "job_id": "uuid",
  "job_code": "JOB-ABC123",
  "job_title": "Senior Backend Engineer",
  "jd_tokens": {
    "input": 1250,
    "output": 850,
    "total": 2100
  },
  "resume_tokens": {
    "input": 85000,
    "output": 60000,
    "total": 145000
  },
  "total_tokens": 147100,
  "resume_count": 100,
  "avg_tokens_per_resume": 1450,
  "total_cost": 0.294
}
```

---

## ===========================================================================
## APPLICATION ENDPOINTS (2)
## ===========================================================================

### 24. SUBMIT APPLICATION (with Resume Upload)
POST /api/v1/applications?job_id={job_id}
Headers: Authorization: Bearer {candidate_token}
Content-Type: multipart/form-data

Form Data:
- resume: [PDF file]
- cover_letter: "I am excited to apply for this position..."

Response (201):
```json
{
  "id": "uuid",
  "job_id": "uuid",
  "candidate_id": "uuid",
  "resume_filename": "john_doe_resume.pdf",
  "resume_size": 256000,
  "cover_letter": "I am excited...",
  "status": "APPLIED",
  "applied_at": "2026-01-24T10:00:00Z",
  "ai_evaluation": {
    "score": 85,
    "summary": "Strong candidate with relevant experience...",
    "recommendation": "strong_match",
    "strengths": ["5+ years Python", "FastAPI experience"],
    "weaknesses": ["Limited AWS experience"]
  }
}
```

---

### 25. UPDATE APPLICATION STATUS (HR, ADMIN)
PATCH /api/v1/applications/{application_id}/status
Headers: Authorization: Bearer {hr_token}

Request:
```json
{
  "status": "REVIEWING"
}
```

Available statuses:
- APPLIED
- REVIEWING
- SHORTLISTED
- INTERVIEW_SCHEDULED
- INTERVIEWED
- OFFERED
- HIRED
- REJECTED
- WITHDRAWN

Response (200):
```json
{
  "id": "uuid",
  "status": "REVIEWING",
  "updated_at": "2026-01-24T11:00:00Z"
}
```

---

## ===========================================================================
## CANDIDATES ENDPOINT (1)
## ===========================================================================

### 26. GET ALL CANDIDATES (HR, ADMIN)
GET /api/v1/candidates
Headers: Authorization: Bearer {hr_token}

Response (200):
```json
{
  "candidates": [
    {
      "application_id": "uuid",
      "job_id": "uuid",
      "job_title": "Senior Backend Engineer",
      "resume_filename": "john_doe_resume.pdf",
      "applied_at": "2026-01-24T10:00:00Z",
      "status": "APPLIED",
      "ai_score": 85.5,
      "recommendation": "strong_match",
      "parsed_data": {
        "personal_info": {
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+1-555-0100",
          "location": "San Francisco, CA"
        },
        "experience": [...],
        "education": [...],
        "skills": {...}
      }
    }
  ],
  "total": 100
}
```

---

## ===========================================================================
## HEALTH CHECK
## ===========================================================================

GET /health

Response (200):
```json
{
  "status": "healthy",
  "timestamp": "2026-01-24T10:00:00Z"
}
```

---

## COMMON HTTP STATUS CODES

- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (invalid/missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 409: Conflict (duplicate resource)
- 413: Payload Too Large (file too big)
- 422: Unprocessable Entity (validation error)
- 500: Internal Server Error

---

## ROLE PERMISSIONS MATRIX

| Endpoint | SUPER_ADMIN | ADMIN | HR | CANDIDATE |
|----------|-------------|-------|-----|-----------|
| POST /companies | ✅ | ❌ | ❌ | ❌ |
| GET /companies | ✅ | ❌ | ❌ | ❌ |
| POST /companies/{id}/users | ✅ | ✅ | ❌ | ❌ |
| GET /companies/{id}/dashboard | ✅ | ✅ | ❌ | ❌ |
| POST /jobs | ✅ | ✅ | ✅ | ❌ |
| POST /jobs/{id}/publish | ✅ | ✅ | ✅ | ❌ |
| GET /candidates | ✅ | ✅ | ✅ | ❌ |
| POST /applications | ✅ | ✅ | ✅ | ✅ |
| PATCH /applications/{id}/status | ✅ | ✅ | ✅ | ❌ |

---

## TESTING WORKFLOW

1. **Login as HR**
   ```bash
   POST /api/v1/auth/login
   { "email": "saifhr@test.com", "password": "1234" }
   ```

2. **Create Job with AI**
   ```bash
   POST /api/v1/jobs
   { "job_title": "Backend Engineer", ... "direct_job_post": false }
   ```

3. **Publish Job**
   ```bash
   POST /api/v1/jobs/{job_id}/publish
   { "post_to_linkedin": true }
   ```

4. **Login as Candidate**
   ```bash
   POST /api/v1/auth/register
   { "email": "candidate@test.com", "password": "test123" }
   
   POST /api/v1/auth/login
   { "email": "candidate@test.com", "password": "test123" }
   ```

5. **Apply with Resume**
   ```bash
   POST /api/v1/applications?job_id={job_id}
   [Upload PDF file]
   ```

6. **View Candidates (as HR)**
   ```bash
   GET /api/v1/candidates
   ```

7. **Check Token Usage**
   ```bash
   GET /api/v1/jobs/{job_id}/token-usage
   ```

---

END OF API DOCUMENTATION
