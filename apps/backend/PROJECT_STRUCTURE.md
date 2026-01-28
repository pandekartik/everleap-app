# Everleap Backend - Complete Project Structure

## Complete Folder Structure

```
everleap-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                         # FastAPI application entry
│   │
│   ├── core/                           # Core utilities
│   │   ├── __init__.py
│   │   ├── config.py                   # Settings (with GROQ_API_KEY, SEARCHXNG_URL)
│   │   ├── security.py                 # JWT, password hashing
│   │   ├── rbac.py                     # Role-based access control
│   │   └── llm.py                      # Groq LLM client
│   │
│   ├── db/                             # Database
│   │   ├── __init__.py
│   │   └── session.py                  # Async DB session management
│   │
│   ├── models/                         # SQLAlchemy models
│   │   └── __init__.py                 # All database models
│   │
│   ├── schemas/                        # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── auth.py                     # Auth request/response schemas
│   │   ├── company.py                  # Company schemas
│   │   ├── job.py                      # Job schemas
│   │   └── application.py              # Application/candidate schemas
│   │
│   ├── api/                            # API routes
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── endpoints/
│   │       │   ├── __init__.py
│   │       │   ├── auth.py             # Authentication endpoints
│   │       │   ├── companies.py        # Company & user management
│   │       │   ├── jobs.py             # Job CRUD + generation + publishing
│   │       │   ├── applications.py     # Application submission + screening
│   │       │   └── candidates.py       # Candidate management
│   │       └── dependencies/
│   │           └── __init__.py
│   │
│   ├── services/                       # Business logic services
│   │   ├── __init__.py
│   │   ├── storage.py                  # Google Cloud Storage
│   │   ├── email.py                    # Gmail SMTP
│   │   ├── audit.py                    # Audit logging
│   │   ├── credit.py                   # Token usage tracking
│   │   ├── unipile.py                  # LinkedIn integration via Unipile
│   │   └── pdf_extractor.py            # PDF text extraction (multilingual)
│   │
│   ├── agents/                         # LangGraph AI Agents
│   │   ├── __init__.py
│   │   ├── base.py                     # Base agent class
│   │   ├── market_research.py          # SearchXNG market research
│   │   ├── jd_generator.py             # Job description generator
│   │   ├── resume_parser.py            # Resume parser (PDF extraction)
│   │   └── resume_screener.py          # AI resume screening
│   │
│   ├── workers/                        # Celery workers
│   │   ├── __init__.py
│   │   ├── celery_app.py               # Celery configuration
│   │   └── tasks.py                    # Async tasks (email, AI processing)
│   │
│   └── utils/                          # Helper utilities
│       ├── __init__.py
│       └── helpers.py
│
├── alembic/                            # Database migrations
│   ├── versions/
│   ├── env.py
│   └── script.py.mako
│
├── scripts/                            # Utility scripts
│   ├── schema.sql                      # Database schema
│   └── init_db.py                      # Database initialization
│
├── tests/                              # Test files
│   ├── __init__.py
│   ├── test_auth.py
│   ├── test_jobs.py
│   └── test_agents.py
│
├── .env.example                        # Environment variables template
├── .gitignore
├── alembic.ini                         # Alembic configuration
├── docker-compose.yml                  # Local development setup
├── Dockerfile                          # Production container
├── requirements.txt                    # Python dependencies
├── README.md                           # Documentation
├── ARCHITECTURE.md                     # Architecture guide
├── QUICKSTART.md                       # Quick start guide
└── PROJECT_STRUCTURE.md                # This file
```

## Implementation Status

### ✅ Already Implemented
- Core configuration with async session management
- Authentication system (JWT, refresh tokens)
- RBAC decorators
- Company management APIs
- User management APIs
- Database schema with all tables
- Docker setup
- Email service
- GCS storage service
- Audit logging
- Credit tracking

### 🔄 To Be Completed (This Implementation)
1. **Core/LLM Module** (`app/core/llm.py`)
   - Groq API client
   - LLM message handling
   
2. **Services**
   - `unipile.py` - LinkedIn job posting
   - `pdf_extractor.py` - Multilingual PDF text extraction

3. **Agents (LangGraph)**
   - `base.py` - Base agent class with LangGraph
   - `market_research.py` - SearchXNG integration
   - `jd_generator.py` - Job description generation
   - `resume_parser.py` - Resume parsing with PDF extraction
   - `resume_screener.py` - AI-powered screening

4. **API Endpoints**
   - `jobs.py` - Complete job management
   - `applications.py` - Application handling with resume upload
   - `candidates.py` - Candidate profile management

5. **Celery Workers**
   - `celery_app.py` - Celery setup
   - `tasks.py` - Background tasks

## Key Features Implementation

### Job Creation Flow
```
POST /api/v1/jobs
↓
If direct_job_post = false:
  ↓
  Market Research Agent (SearchXNG)
  ↓
  JD Generator Agent (Groq LLM)
  ↓
  Save to database with tokens_used
↓
If direct_job_post = true:
  ↓
  Skip agent, save directly
```

### Job Publishing Flow
```
POST /api/v1/jobs/{id}/publish
↓
Create career page URL: https://everleap.in/jobs/JOB-{code}
↓
Post to LinkedIn via Unipile API
↓
Store posting records
↓
Log audit
```

### Application Flow
```
POST /api/v1/applications
↓
Upload resume to GCS
↓
Extract text from PDF (multilingual-pdf2text)
↓
Resume Parser Agent → structured data
↓
Resume Screener Agent → AI evaluation + score
↓
Send confirmation email
↓
Log application
```

## Environment Variables Needed

```bash
# Groq API
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile

# SearchXNG
SEARCHXNG_URL=https://your-searchxng-instance.com/search

# Unipile (LinkedIn)
UNIPILE_API_KEY=your-unipile-key
UNIPILE_API_URL=https://api.unipile.com/v1

# Career Page
CAREER_PAGE_BASE_URL=https://everleap.in/jobs
```

## API Endpoints Summary

### Authentication
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/refresh
- POST /api/v1/auth/set-password
- POST /api/v1/auth/verify-email
- GET /api/v1/auth/me

### Companies (SUPER_ADMIN, ADMIN)
- POST /api/v1/companies
- GET /api/v1/companies
- GET /api/v1/companies/{id}
- PATCH /api/v1/companies/{id}
- GET /api/v1/companies/{id}/dashboard
- POST /api/v1/companies/{id}/users
- GET /api/v1/companies/{id}/users
- PATCH /api/v1/companies/{id}/users/{user_id}

### Jobs (HR, ADMIN)
- POST /api/v1/jobs (with AI generation if direct_job_post=false)
- GET /api/v1/jobs (list with pagination)
- GET /api/v1/jobs/{id}
- PATCH /api/v1/jobs/{id}
- POST /api/v1/jobs/{id}/publish (LinkedIn + career page)
- GET /api/v1/jobs/{id}/applications
- GET /api/v1/jobs/{id}/stats

### Applications (CANDIDATE)
- POST /api/v1/applications (with resume upload)
- GET /api/v1/applications (user's applications)
- GET /api/v1/applications/{id}
- GET /api/v1/applications/{id}/resume (signed URL)

### Applications Management (HR, ADMIN)
- GET /api/v1/applications (all for company)
- PATCH /api/v1/applications/{id}/status
- GET /api/v1/applications/{id}/evaluation

### Candidates (HR, ADMIN)
- GET /api/v1/candidates (parsed resumes for jobs)
- GET /api/v1/candidates/{id}

## Agent Workflows

### Market Research Agent
```python
Input: {job_title, department, location, employment_type, is_remote}
↓
Search SearchXNG for market data
↓
Analyze results with Groq LLM
↓
Output: {salary_range, key_skills, responsibilities, qualifications, benefits, market_insights}
```

### JD Generator Agent
```python
Input: {job_data, market_research, diversity_policy}
↓
Generate comprehensive job description
↓
Output: {job_description, screening_questions, tokens_used}
```

### Resume Parser Agent
```python
Input: {resume_pdf_bytes}
↓
Extract text (multilingual-pdf2text / PyMuPDF)
↓
Parse with Groq LLM
↓
Output: {personal_info, experience, education, skills, certifications}
```

### Resume Screener Agent
```python
Input: {resume_data, job_description}
↓
Analyze fit with Groq LLM
↓
Output: {score, summary, strengths, weaknesses, recommendation}
```

## Credit Tracking

Every AI operation tracks tokens:
- Job description generation
- Resume parsing
- Resume screening
- Market research analysis

Updates `credit_usage` table and `companies.api_credits_used`.

## Next Steps

1. Generate all missing files
2. Test each component
3. Integration testing
4. Deploy to staging
5. Production deployment
