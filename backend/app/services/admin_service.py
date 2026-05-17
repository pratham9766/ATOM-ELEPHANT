from uuid import UUID

from fastapi import status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import DomainError
from app.models.cycle import Cycle
from app.models.user import User
from app.schemas.admin import CycleCreate, CycleUpdate, UserUpdate


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

    async def list_cycles(self) -> list[Cycle]:
        result = await self.db.execute(select(Cycle).order_by(Cycle.created_at.desc()))
        return list(result.scalars().all())

    async def activate_cycle(self, cycle_id: UUID) -> Cycle:
        cycle = await self.db.get(Cycle, cycle_id)
        if cycle is None:
            raise DomainError("Cycle not found.", status_code=status.HTTP_404_NOT_FOUND)
        await self.db.execute(update(Cycle).values(is_active=False))
        cycle.is_active = True
        await self.db.flush()
        return cycle

    async def update_cycle(self, cycle_id: UUID, payload: CycleUpdate) -> Cycle:
        cycle = await self.db.get(Cycle, cycle_id)
        if cycle is None:
            raise DomainError("Cycle not found.", status_code=status.HTTP_404_NOT_FOUND)
        data = payload.model_dump(exclude_unset=True)
        if data.get("is_active") is True:
            await self.db.execute(update(Cycle).where(Cycle.id != cycle_id).values(is_active=False))
        for field, value in data.items():
            setattr(cycle, field, value)
        await self.db.flush()
        return cycle

    async def list_users(self) -> list[User]:
        result = await self.db.execute(select(User).order_by(User.department, User.name))
        return list(result.scalars().all())

    async def update_user(self, user_id: UUID, payload: UserUpdate) -> User:
        user = await self.db.get(User, user_id)
        if user is None:
            raise DomainError("User not found.", status_code=status.HTTP_404_NOT_FOUND)
        data = payload.model_dump(exclude_unset=True)
        for field, value in data.items():
            setattr(user, field, value)
        await self.db.flush()
        return user
