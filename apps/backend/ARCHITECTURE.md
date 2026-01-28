# Everleap Backend - System Architecture & Implementation Guide

## Executive Summary

This document provides a comprehensive overview of the Everleap backend system - a production-ready, enterprise-grade HR automation platform built with FastAPI, PostgreSQL, and modern async Python.

**Status**: ✅ **Production-Ready Foundation Complete**

### What Has Been Built

1. **Complete Database Schema** (PostgreSQL)
   - 13 core tables with proper relationships
   - Triggers for automatic updates
   - Views for common queries
   - Comprehensive indexing
   - Audit logging infrastructure

2. **Authentication & Authorization System**
   - JWT-based authentication (access + refresh tokens)
   - Role-based access control (RBAC) with decorators
   - Password hashing with Argon2
   - Email verification flow
   - Password reset functionality

3. **Multi-Tenant Architecture**
   - Complete company isolation
   - Four-tier role hierarchy (SUPER_ADMIN, ADMIN, HR, CANDIDATE)
   - Strict access control enforcement

4. **Core API Endpoints**
   - Authentication endpoints (register, login, refresh, etc.)
   - Company management (create, update, list)
   - User management (invite, list, update)
   - Dashboard metrics

5. **Service Layer**
   - Google Cloud Storage integration
   - Email service (Gmail SMTP)
   - Audit logging service
   - Credit tracking service

6. **Infrastructure**
   - Docker containerization
   - Docker Compose for local development
   - Alembic database migrations
   - Async database session management
   - Proper error handling

## Architecture Decisions

### Why FastAPI?

1. **Performance**: Built on Starlette and Pydantic, extremely fast
2. **Type Safety**: Native support for Python type hints
3. **Async/Await**: First-class async support for I/O-bound operations
4. **Auto Documentation**: Built-in OpenAPI/Swagger support
5. **Modern Python**: Leverages Python 3.11+ features

### Why Async SQLAlchemy 2.0?

1. **Non-Blocking I/O**: Async queries don't block the event loop
2. **Better Concurrency**: Handle multiple requests efficiently
3. **Resource Efficiency**: Better CPU utilization
4. **Modern ORM**: Latest SQLAlchemy features

### Why PostgreSQL?

1. **ACID Compliance**: Guaranteed data consistency
2. **Advanced Features**: JSON support, full-text search, triggers
3. **Scalability**: Proven at enterprise scale
4. **Rich Ecosystem**: Excellent tooling and extensions

### Why JWT Tokens?

1. **Stateless**: No server-side session storage needed
2. **Scalable**: Works across multiple servers
3. **Industry Standard**: Well-supported by clients
4. **Secure**: Cryptographically signed

## Security Architecture

### Defense in Depth

1. **Authentication Layer**
   - Strong password requirements (min 8 chars, uppercase, lowercase, digit)
   - Argon2 password hashing (OWASP recommended)
   - JWT token expiration and rotation
   - Refresh token revocation

2. **Authorization Layer**
   - Decorator-based role enforcement
   - Company-level access control
   - Resource ownership validation
   - Cannot bypass checks

3. **Data Layer**
   - Parameterized queries (SQL injection prevention)
   - Input validation with Pydantic
   - Soft deletes for audit trail
   - Encrypted connections

4. **Infrastructure Layer**
   - CORS configuration
   - Rate limiting (ready to implement)
   - HTTPS enforcement (production)
   - Docker container isolation

### Authentication Flow

```
1. User Registration/Login
   ↓
2. Password verified with Argon2
   ↓
3. Access token generated (30 min expiry)
   ↓
4. Refresh token generated (7 day expiry)
   ↓
5. Tokens returned to client
   ↓
6. Client includes access token in Authorization header
   ↓
7. Decorator validates token and extracts user
   ↓
8. Role decorator checks authorization
   ↓
9. Request processed
```

## Database Design Principles

### Normalization

- Tables are normalized to 3NF
- Proper foreign key relationships
- No redundant data storage
- Efficient queries with indexes

### Audit Trail

- Soft deletes (`deleted_at` column)
- `audit_logs` table for all critical actions
- Automatic timestamp tracking
- Complete change history

### Performance

- Strategic indexes on foreign keys
- Composite indexes for common queries
- Views for complex aggregations
- Connection pooling

### Data Integrity

- Foreign key constraints with cascade rules
- Check constraints for data validation
- Triggers for automatic updates
- ENUM types for fixed values

## API Design Principles

### RESTful Architecture

```
Resource-based URLs
POST   /api/v1/companies        - Create
GET    /api/v1/companies        - List
GET    /api/v1/companies/{id}   - Read
PATCH  /api/v1/companies/{id}   - Update
DELETE /api/v1/companies/{id}   - Delete (soft)
```

### Versioning

- URL-based versioning (`/api/v1/`)
- Allows backward compatibility
- Clear upgrade path

### Request/Response Format

- JSON for all payloads
- Pydantic schemas for validation
- Consistent error responses
- ISO 8601 datetime format

### Pagination

```python
{
  "items": [...],
  "total": 100,
  "page": 1,
  "page_size": 25,
  "total_pages": 4
}
```

## Error Handling Strategy

### HTTP Status Codes

```
200 OK           - Successful GET
201 Created      - Successful POST
204 No Content   - Successful DELETE
400 Bad Request  - Validation error
401 Unauthorized - Authentication required
403 Forbidden    - Insufficient permissions
404 Not Found    - Resource doesn't exist
409 Conflict     - Duplicate resource
422 Unprocessable Entity - Validation error (detailed)
500 Internal Server Error - System error
```

### Error Response Format

```json
{
  "detail": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Async Context Management

### Database Sessions

```python
# Dependency injection
async def endpoint(db: AsyncSession = Depends(get_db)):
    # Automatic commit/rollback
    pass

# Manual context manager
async with get_db_context() as db:
    # Explicit transaction control
    pass
```

### Benefits

1. **Automatic Resource Management**: No leaked connections
2. **Transaction Safety**: Automatic rollback on errors
3. **Clean Code**: No manual cleanup
4. **Type Safety**: IDE autocomplete support

## Service Layer Pattern

### Why Service Layer?

1. **Separation of Concerns**: Business logic separated from routes
2. **Reusability**: Services used by multiple endpoints
3. **Testability**: Easier to unit test
4. **Maintainability**: Clear organization

### Example Service

```python
# app/services/credit.py
class CreditService:
    @staticmethod
    async def track_usage(
        db: AsyncSession,
        company_id: UUID,
        operation: str,
        tokens_used: int
    ) -> CreditUsage:
        # Business logic here
        pass

# Usage in endpoint
credit_usage = await credit_service.track_jd_generation(
    db, company_id, user_id, job_id, tokens_used
)
```

## RBAC Implementation

### Decorator-Based Authorization

```python
@router.post("/jobs")
@require_hr()  # Enforces HR, ADMIN, or SUPER_ADMIN
async def create_job(
    current_user: CurrentUser = Depends(get_current_verified_user)
):
    # Only accessible by authorized roles
    pass
```

### Role Hierarchy

```
SUPER_ADMIN → Can do everything
    ↓
ADMIN → Can manage company, users, jobs
    ↓
HR → Can manage jobs, applications
    ↓
CANDIDATE → Can apply to jobs
```

### Access Control Matrix

| Action | SUPER_ADMIN | ADMIN | HR | CANDIDATE |
|--------|-------------|-------|-----|-----------|
| Create Company | ✅ | ❌ | ❌ | ❌ |
| Add Users | ✅ | ✅ | ❌ | ❌ |
| Create Jobs | ✅ | ✅ | ✅ | ❌ |
| Apply to Jobs | ✅ | ✅ | ✅ | ✅ |
| Review Applications | ✅ | ✅ | ✅ | ❌ |

## File Storage Strategy

### Why Google Cloud Storage?

1. **Durability**: 11 nines (99.999999999%)
2. **Scalability**: No storage limits
3. **Security**: IAM-based access control
4. **Cost-Effective**: Pay-per-use model

### File Organization

```
gs://everleap-resumes/
  └── resumes/
      └── {company_id}/
          └── {job_id}/
              └── {candidate_id}/
                  └── {filename}
```

### Access Control

1. **Upload**: Application has write access
2. **Download**: Signed URLs (temporary access)
3. **Expiration**: URLs expire after 1 hour
4. **Privacy**: Company data isolation

## Email System Design

### Templated Emails

1. **Welcome Email**: User invitation
2. **Application Received**: Candidate confirmation
3. **Interview Scheduled**: Interview invitation
4. **Password Reset**: Security recovery

### Async Sending

```python
# Non-blocking email send
await email_service.send_welcome_email(
    to_email=user.email,
    user_name=user.full_name,
    company_name=company.name,
    activation_link=link
)
```

### Email Queue (Future Enhancement)

- Store in `email_queue` table
- Celery worker processes queue
- Retry on failure
- Priority handling

## Credit Tracking System

### Purpose

Monitor AI usage and costs:
- Job description generation
- Resume parsing
- Resume screening

### Implementation

```python
await credit_service.track_jd_generation(
    db=db,
    company_id=company.id,
    user_id=user.id,
    job_id=job.id,
    tokens_used=1500
)
```

### Company Limits

```python
# Check if company has enough credits
has_credits = await credit_service.check_credits_available(
    db, company_id, required_tokens=1000
)

if not has_credits:
    raise HTTPException(
        status_code=402,
        detail="Insufficient API credits"
    )
```

## Testing Strategy

### Unit Tests

```python
# Test individual functions
def test_password_hashing():
    password = "TestPass123!"
    hashed = get_password_hash(password)
    assert verify_password(password, hashed)
```

### Integration Tests

```python
# Test API endpoints
async def test_create_job():
    response = await client.post(
        "/api/v1/jobs",
        headers=auth_headers,
        json=job_data
    )
    assert response.status_code == 201
```

### Database Tests

```python
# Test database operations
async def test_user_creation():
    async with get_db_context() as db:
        user = User(email="test@example.com")
        db.add(user)
        await db.commit()
        assert user.id is not None
```

## Deployment Considerations

### Environment Variables

**Critical**: Never commit secrets to git

```bash
# Use environment-specific files
.env.development
.env.staging
.env.production
```

### Database Migrations

```bash
# Generate migration
alembic revision --autogenerate -m "Add column"

# Review generated migration
# Edit if needed

# Apply to production
alembic upgrade head
```

### Monitoring

**Recommended Tools**:
- Sentry (error tracking)
- DataDog (performance monitoring)
- CloudWatch (AWS infrastructure)
- Prometheus + Grafana (metrics)

### Scaling

**Horizontal Scaling**:
- Run multiple API instances
- Load balancer (e.g., Nginx, AWS ALB)
- Shared PostgreSQL database
- Redis for session storage

**Vertical Scaling**:
- Increase server resources
- Optimize database queries
- Add read replicas

## What's Next (To Implement)

### High Priority

1. **Jobs API Endpoints**
   - Create job
   - Update job
   - Publish job (LinkedIn integration)
   - List jobs with filters

2. **Applications API Endpoints**
   - Submit application with resume upload
   - List applications
   - Update application status
   - Resume download via signed URL

3. **AI Agents**
   - Job description generator (SearchXNG + LLM)
   - Resume parser (extract structured data)
   - Resume screener (AI evaluation)

4. **Interviews API**
   - Schedule interview
   - Update interview
   - Add feedback

### Medium Priority

1. **Celery Tasks**
   - Async email sending
   - Background AI processing
   - Scheduled reminders

2. **WebSocket Support**
   - Real-time notifications
   - Interview updates
   - Application status changes

3. **Advanced Search**
   - Full-text search on jobs
   - Candidate search by skills
   - Filter by location, salary, etc.

### Low Priority

1. **Analytics Dashboard**
   - Hiring funnel metrics
   - Time-to-hire statistics
   - Source effectiveness

2. **Export Features**
   - CSV export of applications
   - PDF reports
   - Interview summaries

3. **Integrations**
   - Calendar (Google Calendar, Outlook)
   - Background checks (Checkr)
   - Video interviews (Zoom, Teams)

## Code Quality Checklist

✅ **Type Hints**: All functions have type annotations
✅ **Docstrings**: All modules and functions documented
✅ **Error Handling**: Proper exception handling throughout
✅ **Input Validation**: Pydantic schemas for all inputs
✅ **SQL Injection Safe**: Parameterized queries via ORM
✅ **Password Security**: Argon2 hashing
✅ **Authentication**: JWT with proper expiration
✅ **Authorization**: Role-based decorators
✅ **Audit Logging**: Critical actions logged
✅ **Soft Deletes**: Data preservation
✅ **Transaction Safety**: Proper commit/rollback
✅ **Resource Management**: Context managers for DB sessions
✅ **Configuration**: Environment-based settings
✅ **Docker Ready**: Complete containerization
✅ **Database Migrations**: Alembic setup
✅ **Documentation**: Comprehensive README

## Conclusion

This implementation provides a solid, production-ready foundation for the Everleap HR automation platform. The architecture is:

- **Secure**: Defense in depth with multiple security layers
- **Scalable**: Async design handles high concurrency
- **Maintainable**: Clean separation of concerns
- **Testable**: Proper abstractions for unit testing
- **Extensible**: Easy to add new features
- **Professional**: Follows industry best practices

The system is ready for deployment and can be extended with the job posting, application processing, and AI agent functionality as the next phase of development.
