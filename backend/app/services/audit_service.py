from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog
from app.models.enums import AuditAction
from app.repositories.audit import AuditRepository


class AuditService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = AuditRepository(db)

    async def record(
        self,
        *,
        entity_type: str,
        entity_id: UUID,
        action: AuditAction,
        actor_id: UUID | None,
        old_value: dict | None = None,
        new_value: dict | None = None,
    ) -> AuditLog:
        return await self.repo.add(
            AuditLog(
                entity_type=entity_type,
                entity_id=entity_id,
                action=action,
                old_value=old_value,
                new_value=new_value,
                changed_by=actor_id,
                timestamp=datetime.now(UTC),
            )
        )
