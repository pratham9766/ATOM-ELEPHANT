from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cycle import Cycle
from app.schemas.admin import CycleCreate


class AdminService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_cycle(self, payload: CycleCreate) -> Cycle:
        if payload.is_active:
            await self.db.execute(update(Cycle).values(is_active=False))
        cycle = Cycle(**payload.model_dump())
        self.db.add(cycle)
        await self.db.flush()
        return cycle
