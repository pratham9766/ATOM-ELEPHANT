from uuid import UUID

from fastapi import APIRouter, status

from app.core.deps import CurrentUser, DbSession
from app.schemas.goal import (
    GoalCreate,
    GoalOut,
    GoalSheetCreate,
    GoalSheetOut,
    GoalUpdate,
    SubmitSheetRequest,
    WeightageSummary,
)
from app.services.goal_service import GoalService

router = APIRouter(prefix="/goals", tags=["goals"])


@router.post("/sheets", response_model=GoalSheetOut, status_code=status.HTTP_201_CREATED)
async def create_goal_sheet(body: GoalSheetCreate, db: DbSession, current_user: CurrentUser) -> GoalSheetOut:
    sheet = await GoalService(db).get_or_create_sheet(current_user, body.cycle_id)
    response = GoalSheetOut.model_validate(sheet)
    await db.commit()
    return response


@router.get("/sheets/me", response_model=GoalSheetOut)
async def get_my_goal_sheet(db: DbSession, current_user: CurrentUser) -> GoalSheetOut:
    sheet = await GoalService(db).get_or_create_sheet(current_user)
    response = GoalSheetOut.model_validate(sheet)
    await db.commit()
    return response


@router.get("/sheets/{sheet_id}", response_model=GoalSheetOut)
async def get_goal_sheet(sheet_id: UUID, db: DbSession, current_user: CurrentUser) -> GoalSheetOut:
    sheet = await GoalService(db).authorize_sheet_access(sheet_id, current_user)
    return GoalSheetOut.model_validate(sheet)


@router.get("/sheets/{sheet_id}/weightage", response_model=WeightageSummary)
async def weightage_summary(sheet_id: UUID, db: DbSession, current_user: CurrentUser) -> WeightageSummary:
    service = GoalService(db)
    sheet = await service.authorize_sheet_access(sheet_id, current_user)
    summary = service.summarize_weightage(sheet)
    return WeightageSummary(**summary.__dict__)


@router.post("/sheets/{sheet_id}/goals", response_model=GoalOut, status_code=status.HTTP_201_CREATED)
async def add_goal(sheet_id: UUID, body: GoalCreate, db: DbSession, current_user: CurrentUser) -> GoalOut:
    service = GoalService(db)
    sheet = await service.authorize_sheet_access(sheet_id, current_user)
    goal = await service.add_goal(sheet, current_user, body)
    response = GoalOut.model_validate(goal)
    await db.commit()
    return response


@router.patch("/sheets/{sheet_id}/goals/{goal_id}", response_model=GoalOut)
async def update_goal(
    sheet_id: UUID,
    goal_id: UUID,
    body: GoalUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> GoalOut:
    service = GoalService(db)
    sheet = await service.authorize_sheet_access(sheet_id, current_user)
    goal = await service.update_goal(sheet, goal_id, current_user, body)
    response = GoalOut.model_validate(goal)
    await db.commit()
    return response


@router.delete("/sheets/{sheet_id}/goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    sheet_id: UUID,
    goal_id: UUID,
    db: DbSession,
    current_user: CurrentUser,
) -> None:
    service = GoalService(db)
    sheet = await service.authorize_sheet_access(sheet_id, current_user)
    await service.delete_goal(sheet, goal_id, current_user)
    await db.commit()


@router.post("/sheets/{sheet_id}/submit", response_model=GoalSheetOut)
async def submit_goal_sheet(
    sheet_id: UUID,
    body: SubmitSheetRequest,
    db: DbSession,
    current_user: CurrentUser,
) -> GoalSheetOut:
    service = GoalService(db)
    sheet = await service.authorize_sheet_access(sheet_id, current_user)
    sheet = await service.submit(sheet, current_user, body.version)
    response = GoalSheetOut.model_validate(sheet)
    await db.commit()
    return response
