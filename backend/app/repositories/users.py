from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.enums import UserRole


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get(self, user_id: UUID) -> User | None:
        return await self.db.get(User, user_id)

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email.lower()))
        return result.scalar_one_or_none()

    async def list_direct_reports(self, manager_id: UUID) -> list[User]:
        result = await self.db.execute(
            select(User).where(User.manager_id == manager_id, User.is_active.is_(True))
        )
        return list(result.scalars().all())

    async def direct_reports(self, manager_id: UUID) -> list[User]:
        return await self.list_direct_reports(manager_id)

    async def active_employees(self) -> list[User]:
        result = await self.db.execute(
            select(User).where(User.role == UserRole.employee, User.is_active.is_(True)).order_by(User.department, User.name)
        )
        return list(result.scalars().all())
