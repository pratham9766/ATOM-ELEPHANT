from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.cycle import Cycle
from app.models.goal import Goal
from app.models.goal_sheet import GoalSheet


class GoalRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def active_cycle(self) -> Cycle | None:
        result = await self.db.execute(select(Cycle).where(Cycle.is_active.is_(True)))
        return result.scalar_one_or_none()

    async def get_sheet(self, sheet_id: UUID) -> GoalSheet | None:
        result = await self.db.execute(
            select(GoalSheet).options(selectinload(GoalSheet.goals)).where(GoalSheet.id == sheet_id)
        )
        return result.scalar_one_or_none()

    async def get_sheet_for_user_cycle(self, user_id: UUID, cycle_id: UUID) -> GoalSheet | None:
        result = await self.db.execute(
            select(GoalSheet)
            .options(selectinload(GoalSheet.goals))
            .where(GoalSheet.user_id == user_id, GoalSheet.cycle_id == cycle_id)
        )
        return result.scalar_one_or_none()

    async def get_goal(self, goal_id: UUID) -> Goal | None:
        return await self.db.get(Goal, goal_id)

    async def team_submissions(self, manager_id: UUID) -> list[GoalSheet]:
        result = await self.db.execute(
            select(GoalSheet)
            .join(GoalSheet.user)
            .options(selectinload(GoalSheet.goals), selectinload(GoalSheet.user))
            .where(GoalSheet.user.has(manager_id=manager_id))
            .order_by(GoalSheet.updated_at.desc())
        )
        return list(result.scalars().unique().all())
