from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.escalation import EscalationEvent, EscalationRule


class EscalationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_rules(self) -> list[EscalationRule]:
        result = await self.db.execute(select(EscalationRule).order_by(EscalationRule.threshold_days.asc()))
        return list(result.scalars().all())

    async def list_events(self, limit: int = 100) -> list[EscalationEvent]:
        result = await self.db.execute(
            select(EscalationEvent)
            .options(selectinload(EscalationEvent.rule))
            .order_by(EscalationEvent.fired_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
