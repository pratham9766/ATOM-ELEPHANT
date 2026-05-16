from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.checkin import Checkin
from app.models.enums import Quarter


class CheckinRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_for_goal_quarter(self, goal_id: UUID, quarter: Quarter) -> Checkin | None:
        result = await self.db.execute(
            select(Checkin)
            .options(selectinload(Checkin.goal), selectinload(Checkin.comments))
            .where(Checkin.goal_id == goal_id, Checkin.quarter == quarter)
        )
        return result.scalar_one_or_none()
