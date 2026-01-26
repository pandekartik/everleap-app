# Everleap - Lean Autonomous HR Swarm

**Production-Ready Backend System for AI-Powered HR Automation**

## 🎯 Overview

Everleap is an enterprise-grade, multi-tenant HR automation platform built with FastAPI, PostgreSQL, and modern async Python. It provides a complete backend infrastructure for managing hiring workflows, from job posting to onboarding, with AI-powered resume screening and job description generation.

### Key Features

- **Multi-Tenant Architecture**: Complete company isolation with role-based access control
- **AI-Powered Agents**: Job description generation, resume parsing, and candidate screening
- **Async-First Design**: Built on FastAPI with async SQLAlchemy for high performance
- **Production-Grade Security**: JWT authentication, role-based authorization, password hashing with Argon2
- **Comprehensive Audit Logging**: Track all user actions and system events
- **Credit Tracking**: Monitor AI token usage and costs per company
- **File Management**: Google Cloud Storage integration for resume handling
- **Email Automation**: Gmail SMTP integration with templated emails
- **LinkedIn Integration**: Job posting via Unipile API

## 🏗 Architecture

### Tech Stack

- **Backend Framework**: FastAPI 0.109+
- **Database**: PostgreSQL 14+ with asyncpg
- **ORM**: SQLAlchemy 2.0 (async)
- **Migrations**: Alembic
- **Caching**: Redis
- **Task Queue**: RabbitMQ + Celery
- **Authentication**: JWT (Access + Refresh Tokens)
- **Storage**: Google Cloud Storage
- **Email**: Gmail SMTP
- **AI/LLM**: OpenAI GPT-4
- **Deployment**: Docker + Docker Compose

### Role Hierarchy

```
SUPER_ADMIN (Platform Team)
├── Can create companies
├── Can create company admins
└── Can view all tenants

ADMIN (Company Level)
├── Can add HR users
├── Can add other Admins
├── Can manage company settings
└── Cannot create Super Admins

HR (Hiring Manager)
├── Can create jobs
├── Can approve job descriptions
├── Can review candidates
├── Can schedule interviews
└── Can trigger onboarding

CANDIDATE
├── Can register & login
├── Can apply to jobs
├── Can upload resumes
└── Can track application status
```

## 📋 Database Schema

The system uses a comprehensive PostgreSQL schema with:

- **13 Core Tables**: Companies, Users, Jobs, Applications, etc.
- **Strong Foreign Keys**: Proper relationships and cascading deletes
- **Soft Deletes**: Audit-friendly data retention
- **Triggers**: Automatic timestamp updates, credit tracking
- **Views**: Pre-built aggregations for dashboards
- **Indexes**: Optimized for common query patterns

### Core Tables

1. `companies` - Multi-tenant organization data
2. `users` - User accounts with company association
3. `user_roles` - Role assignments
4. `jobs` - Job postings with AI-generated descriptions
5. `applications` - Candidate applications with resumes
6. `resume_evaluations` - AI screening results
7. `interviews` - Interview scheduling and feedback
8. `onboarding_tasks` - Post-hire onboarding workflow
9. `audit_logs` - Complete audit trail
10. `credit_usage` - AI token usage tracking
11. `oauth_tokens` - LinkedIn/Unipile integration
12. `email_templates` - Customizable email templates
13. `email_queue` - Async email sending

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Redis 7+
- RabbitMQ 3+
- Docker & Docker Compose (optional)
- Google Cloud Storage account
- Gmail account with app password
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd everleap-backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Initialize database**
```bash
# Create database
createdb everleap_db

# Run schema
psql -U postgres -d everleap_db -f scripts/schema.sql

# Or use Alembic migrations
alembic upgrade head
```

6. **Run the application**
```bash
# Development
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn app.main:app --workers 4 --host 0.0.0.0 --port 8000
```

### Using Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

## 📡 API Documentation

### Base URL
- Development: `http://localhost:8000`
- Production: `https://your-domain.com`

### API Endpoints

#### Authentication (`/api/v1/auth`)

```
POST   /auth/register              - Register candidate account
POST   /auth/login                 - User login
POST   /auth/refresh               - Refresh access token
POST   /auth/set-password          - Set password (invited users)
POST   /auth/verify-email          - Verify email address
POST   /auth/request-password-reset - Request password reset
POST   /auth/reset-password        - Reset password
GET    /auth/me                    - Get current user info
POST   /auth/logout                - Logout (revoke token)
```

#### Companies (`/api/v1/companies`)

```
POST   /companies                           - Create company (SUPER_ADMIN)
GET    /companies                           - List all companies (SUPER_ADMIN)
GET    /companies/{id}                      - Get company details
PATCH  /companies/{id}                      - Update company (ADMIN)
GET    /companies/{id}/dashboard            - Get dashboard metrics (ADMIN)
POST   /companies/{id}/users                - Add user (ADMIN)
GET    /companies/{id}/users                - List company users (ADMIN)
PATCH  /companies/{id}/users/{user_id}     - Update user (ADMIN)
```

#### Jobs (`/api/v1/jobs`) - *To be implemented*

```
POST   /jobs                      - Create job (HR)
GET    /jobs                      - List jobs
GET    /jobs/{id}                 - Get job details
PATCH  /jobs/{id}                 - Update job (HR)
POST   /jobs/{id}/publish         - Publish job (HR)
GET    /jobs/{id}/applications    - Get job applications (HR)
GET    /jobs/{id}/stats           - Get application statistics (HR)
```

#### Applications (`/api/v1/applications`) - *To be implemented*

```
POST   /applications              - Submit application (CANDIDATE)
GET    /applications              - List applications
GET    /applications/{id}         - Get application details
PATCH  /applications/{id}/status  - Update application status (HR)
GET    /applications/{id}/resume  - Get resume signed URL
```

### Authentication

All authenticated endpoints require a Bearer token:

```
Authorization: Bearer <access_token>
```

### Interactive Documentation

- **Swagger UI**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc

## 🔒 Security Features

### Authentication & Authorization

- **JWT Tokens**: Secure access and refresh tokens
- **Password Hashing**: Argon2 algorithm (OWASP recommended)
- **Role-Based Access Control**: Decorator-based enforcement
- **Token Expiration**: Configurable expiry times
- **Refresh Token Rotation**: Enhanced security

### Data Protection

- **Soft Deletes**: Audit-friendly data retention
- **Audit Logging**: Complete trail of all actions
- **Input Validation**: Pydantic schemas
- **SQL Injection Protection**: SQLAlchemy ORM
- **CORS Configuration**: Strict origin control

### File Security

- **GCS IAM**: Separate bucket access control
- **Signed URLs**: Temporary file access
- **File Type Validation**: Allowed extensions only
- **Size Limits**: Configurable upload limits

## 📊 Monitoring & Logging

### Audit Logs

All critical actions are logged:
- User creation and role assignments
- Job postings
- Application submissions
- Hiring decisions
- Login attempts
- Data modifications

### Credit Tracking

Monitor AI usage:
```python
from app.services.credit import credit_service

# Track job description generation
await credit_service.track_jd_generation(
    db=db,
    company_id=company_id,
    user_id=user_id,
    job_id=job_id,
    tokens_used=1500
)

# Get company usage summary
usage = await credit_service.get_company_usage(db, company_id)
```

### Health Checks

```
GET /health - Application health status
```

## 🧪 Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run with verbose output
pytest -v
```

## 🔄 Database Migrations

### Create Migration

```bash
# Auto-generate migration from model changes
alembic revision --autogenerate -m "Add new table"

# Create empty migration
alembic revision -m "Custom migration"
```

### Apply Migrations

```bash
# Upgrade to latest
alembic upgrade head

# Upgrade by one version
alembic upgrade +1

# Downgrade by one version
alembic downgrade -1

# View migration history
alembic history
```

## 📦 Project Structure

```
everleap-backend/
├── alembic/                    # Database migrations
│   ├── versions/
│   └── env.py
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/      # API route handlers
│   │       │   ├── auth.py
│   │       │   ├── companies.py
│   │       │   ├── jobs.py     # To be added
│   │       │   └── applications.py  # To be added
│   │       └── dependencies/   # Shared dependencies
│   ├── core/
│   │   ├── config.py          # Settings management
│   │   ├── security.py        # Auth utilities
│   │   └── rbac.py            # Role-based access control
│   ├── db/
│   │   └── session.py         # Database connection
│   ├── models/                # SQLAlchemy models
│   │   └── __init__.py
│   ├── schemas/               # Pydantic schemas
│   │   ├── auth.py
│   │   ├── company.py
│   │   ├── job.py
│   │   └── application.py
│   ├── services/              # Business logic
│   │   ├── storage.py         # GCS integration
│   │   ├── email.py           # Email service
│   │   ├── audit.py           # Audit logging
│   │   └── credit.py          # Credit tracking
│   ├── agents/                # AI agents (to be implemented)
│   │   ├── jd_generator.py
│   │   ├── resume_parser.py
│   │   └── resume_screener.py
│   ├── utils/                 # Helper utilities
│   └── main.py                # Application entry point
├── scripts/
│   └── schema.sql             # Database schema
├── tests/                     # Test files
├── .env.example               # Environment template
├── .gitignore
├── alembic.ini                # Alembic configuration
├── docker-compose.yml         # Docker services
├── Dockerfile                 # Application container
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```bash
# Application
APP_NAME=Everleap
ENVIRONMENT=production
SECRET_KEY=<32+ character secret>

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db

# Google Cloud Storage
GCS_PROJECT_ID=your-project-id
GCS_BUCKET_NAME=everleap-resumes
GCS_CREDENTIALS_PATH=/path/to/key.json

# Email
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# AI
OPENAI_API_KEY=sk-...

# URLs
FRONTEND_URL=https://your-domain.com
```

## 🚢 Deployment

### Production Checklist

- [ ] Set strong `SECRET_KEY` (32+ characters)
- [ ] Configure `DATABASE_URL` with production credentials
- [ ] Set up GCS bucket with proper IAM
- [ ] Configure Gmail app password
- [ ] Set `ENVIRONMENT=production`
- [ ] Disable `DEBUG=False`
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

### Docker Deployment

```bash
# Build image
docker build -t everleap-backend .

# Run container
docker run -d \
  --name everleap-api \
  -p 8000:8000 \
  --env-file .env \
  everleap-backend
```

### Kubernetes Deployment

```yaml
# deployment.yaml (example)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: everleap-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: everleap-api
  template:
    metadata:
      labels:
        app: everleap-api
    spec:
      containers:
      - name: api
        image: everleap-backend:latest
        ports:
        - containerPort: 8000
        envFrom:
        - secretRef:
            name: everleap-secrets
```

## 📝 Development Guidelines

### Code Style

- **PEP 8**: Follow Python style guide
- **Type Hints**: Use type annotations
- **Docstrings**: Document all functions
- **Black**: Auto-formatting (line length 100)
- **Async/Await**: Use async for all I/O operations

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/job-endpoints

# Make changes and commit
git add .
git commit -m "feat: add job creation endpoint"

# Push and create PR
git push origin feature/job-endpoints
```

### Commit Message Format

```
feat: add new feature
fix: bug fix
docs: documentation changes
refactor: code refactoring
test: add or update tests
chore: maintenance tasks
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is proprietary and confidential.

## 👥 Team

- **Backend Architecture**: Senior Software Engineers
- **Database Design**: Database Architects
- **Security**: Security Engineers
- **DevOps**: Infrastructure Team

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Contact the development team
- Check documentation at `/docs`

---

**Built with ❤️ using FastAPI, PostgreSQL, and modern Python**
