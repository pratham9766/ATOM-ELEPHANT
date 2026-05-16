from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.core.deps import CurrentUser, DbSession, require_roles
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.goal import CheckinOut, CheckinUpsert, ManagerCommentCreate, ManagerCommentOut
from app.services.checkin_service import CheckinService

router = APIRouter(prefix="/checkins", tags=["checkins"])
ManagerUser = Annotated[User, Depends(require_roles([UserRole.manager, UserRole.admin]))]


@router.post("", response_model=CheckinOut, status_code=status.HTTP_201_CREATED)
async def upsert_checkin(body: CheckinUpsert, db: DbSession, current_user: CurrentUser) -> CheckinOut:
    checkin = await CheckinService(db).upsert(current_user, body)
    await db.commit()
    return CheckinOut.model_validate(checkin)


@router.post("/{checkin_id}/comments", response_model=ManagerCommentOut, status_code=status.HTTP_201_CREATED)
async def add_manager_comment(
    checkin_id: UUID,
    body: ManagerCommentCreate,
    db: DbSession,
    current_user: ManagerUser,
) -> ManagerCommentOut:
    comment = await CheckinService(db).add_manager_comment(checkin_id, current_user, body.comment)
    await db.commit()
    return ManagerCommentOut.model_validate(comment)
