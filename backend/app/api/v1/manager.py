from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends

from app.core.deps import DbSession, require_roles
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.goal import GoalOut, GoalSheetOut, GoalUpdate, ReturnForReworkRequest
from app.services.goal_service import GoalService

router = APIRouter(prefix="/manager", tags=["manager"])
ManagerUser = Annotated[User, Depends(require_roles([UserRole.manager, UserRole.admin]))]


@router.get("/team-submissions", response_model=list[GoalSheetOut])
async def team_submissions(db: DbSession, current_user: ManagerUser) -> list[GoalSheetOut]:
    sheets = await GoalService(db).team_submissions(current_user)
    return [GoalSheetOut.model_validate(sheet) for sheet in sheets]


@router.post("/goal-sheets/{sheet_id}/approve", response_model=GoalSheetOut)
async def approve_sheet(sheet_id: UUID, db: DbSession, current_user: ManagerUser) -> GoalSheetOut:
    service = GoalService(db)
    sheet = await service.authorize_sheet_access(sheet_id, current_user)
    sheet = await service.approve(sheet, current_user)
    await db.commit()
    return GoalSheetOut.model_validate(sheet)


@router.post("/goal-sheets/{sheet_id}/return", response_model=GoalSheetOut)
async def return_sheet(
    sheet_id: UUID,
    body: ReturnForReworkRequest,
    db: DbSession,
    current_user: ManagerUser,
) -> GoalSheetOut:
    service = GoalService(db)
    sheet = await service.authorize_sheet_access(sheet_id, current_user)
    sheet = await service.return_for_rework(sheet, current_user, body.comment)
    await db.commit()
    return GoalSheetOut.model_validate(sheet)


@router.patch("/goal-sheets/{sheet_id}/goals/{goal_id}", response_model=GoalOut)
async def inline_edit_goal(
    sheet_id: UUID,
    goal_id: UUID,
    body: GoalUpdate,
    db: DbSession,
    current_user: ManagerUser,
) -> GoalOut:
    service = GoalService(db)
    sheet = await service.authorize_sheet_access(sheet_id, current_user)
    goal = await service.update_goal(sheet, goal_id, current_user, body)
    await db.commit()
    return GoalOut.model_validate(goal)
