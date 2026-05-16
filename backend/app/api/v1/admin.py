from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query

from app.core.deps import DbSession, require_roles
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.audit import AuditRepository
from app.schemas.admin import AdminUnlockRequest, AuditLogOut, CycleCreate, CycleOut
from app.services.admin_service import AdminService
from app.services.goal_service import GoalService

router = APIRouter(prefix="/admin", tags=["admin"])
AdminUser = Annotated[User, Depends(require_roles([UserRole.admin]))]


@router.post("/cycles", response_model=CycleOut)
async def create_cycle(body: CycleCreate, db: DbSession, _: AdminUser) -> CycleOut:
    cycle = await AdminService(db).create_cycle(body)
    await db.commit()
    return CycleOut.model_validate(cycle)


@router.post("/goal-sheets/{sheet_id}/unlock", response_model=dict)
async def unlock_goal_sheet(
    sheet_id: UUID, body: AdminUnlockRequest, db: DbSession, current_user: AdminUser
) -> dict:
    service = GoalService(db)
    sheet = await service.authorize_sheet_access(sheet_id, current_user)
    sheet = await service.admin_unlock(sheet, current_user, body.reason)
    await db.commit()
    return {"message": "Goal sheet unlocked for rework.", "sheet_id": str(sheet.id)}


@router.get("/audit-logs", response_model=list[AuditLogOut])
async def audit_logs(
    db: DbSession,
    _: AdminUser,
    entity_type: str | None = None,
    actor_id: UUID | None = None,
    limit: int = Query(default=100, ge=1, le=500),
) -> list[AuditLogOut]:
    logs = await AuditRepository(db).list(entity_type=entity_type, actor_id=actor_id, limit=limit)
    return [AuditLogOut.model_validate(log) for log in logs]
