---name: fastapi-developerdescription: Develop FastAPI backend endpoints with SQLAlchemy and Pydantic patternslicense: MITcompatibility: opencodemetadata:  audience: developers  stack: python-fastapi  project: arunachala-web---
## What I do
- Create FastAPI endpoints following REST conventions
- Implement Pydantic models for request/response validation
- Set up SQLAlchemy models with proper relationships
- Write async database operations with best practices
- Implement JWT authentication when needed
- Add proper error handling and status codes
- Create API documentation with FastAPI auto-docs

## When to use me
Use this when you need to:
- Create new API endpoints
- Modify existing backend logic
- Set up database models
- Implement authentication/authorization
- Add input validation
- Write database operations

## My patterns for Arunachala Web (Clean Architecture)
- **Routers (`app/api/`)**: STRICTLY for HTTP Request/Response handling.
  - ❌ NO business logic here.
  - ❌ NO direct database queries here (SQLAlchemy).
  - ✅ CALLS services.
- **Services (`app/services/`)**: Business Logic & Use Cases.
  - ✅ IMPLEMENTS business rules.
  - ✅ CALLS database models/crud.
  - ✅ RETURNS Pydantic models (DTOs) to routers, not ORM objects.
- **Models (`app/models/`)**: Database definitions only.
- **Patterns**:
  - Dependency Injection for services/db sessions.
  - Pydantic v2 schemas for all input/output.
  - Async/await everywhere.

## Technology specifics
- FastAPI with async support
- PostgreSQL with SQLAlchemy 2.0
- Pydantic v2 for validation
- python-jose for JWT tokens
- psycopg2-binary for PostgreSQL connection