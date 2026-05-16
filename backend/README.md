# ELEPHANT Backend

Production-grade FastAPI foundation for the ELEPHANT goal setting and performance intelligence platform.

## Architecture

- `app/api/v1`: REST route layer only. No business logic.
- `app/core`: settings, security, exceptions, logging, dependency guards.
- `app/db`: async SQLAlchemy engine/session and declarative base.
- `app/models`: SQLAlchemy 2.0 models and enterprise enums.
- `app/schemas`: Pydantic v2 request/response contracts consumed by the frontend.
- `app/repositories`: database query boundaries.
- `app/services`: domain services for auth, goals, check-ins, admin, audit, scoring.
- `app/workflows`: reusable workflow state machine.
- `app/audit`: audit actor context and SQLAlchemy event listeners.
- `app/analytics`: analytics aggregation services.
- `app/tasks`: Celery task entrypoints for escalations and report generation.

## Workflow

Goal sheet states:

- `draft`
- `submitted`
- `rework`
- `approved`
- `locked`

Allowed transitions:

- `draft -> submitted`
- `submitted -> approved`
- `submitted -> rework`
- `rework -> submitted`
- `approved -> locked`
- `locked -> rework` through admin unlock

The service layer validates transitions, RBAC, ownership, manager/direct-report relationships, and submission rules.

## Validation Rules

- Total goal weightage must equal `100`.
- Minimum goal weightage is `10`.
- Maximum goals per sheet is `8`.
- Validation errors return human-readable messages such as:
  - `Current total weightage is 92%. Add 8% more before submission.`

## Local Setup

```powershell
cd D:\Pratham\ELEPHANT\backend
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
docker compose up -d
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

OpenAPI:

```text
http://127.0.0.1:8000/docs
```

## Verification

```powershell
.\.venv\Scripts\python.exe -m ruff check app
$env:PYTHONDONTWRITEBYTECODE='1'; .\.venv\Scripts\python.exe -B -c "from app.main import app; print(len(app.openapi()['paths']))"
```

## Future Extensions

- Entra ID / MSAL token verification in `AuthService`.
- WebSocket push events for dashboard updates.
- Redis pub/sub for shared goal sync.
- Celery Beat schedule for escalation thresholds.
- Teams adaptive cards and email templates.
- Excel report generation with async delivery.
