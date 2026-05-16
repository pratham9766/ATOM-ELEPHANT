from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.escalation import EscalationEvent, EscalationRule
from app.repositories.escalations import EscalationRepository
from app.schemas.admin import EscalationRuleCreate


class EscalationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = EscalationRepository(db)

    async def create_rule(self, payload: EscalationRuleCreate) -> EscalationRule:
        rule = EscalationRule(**payload.model_dump())
        self.db.add(rule)
        await self.db.flush()
        return rule

    async def list_rules(self) -> list[EscalationRule]:
        return await self.repo.list_rules()

    async def list_events(self) -> list[EscalationEvent]:
        return await self.repo.list_events()

    async def fire_demo_event(self, rule: EscalationRule, target_user_id) -> EscalationEvent:
        event = EscalationEvent(rule_id=rule.id, target_user_id=target_user_id, fired_at=datetime.now(UTC))
        self.db.add(event)
        await self.db.flush()
        return event
