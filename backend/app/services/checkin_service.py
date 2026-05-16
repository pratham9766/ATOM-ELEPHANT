from datetime import UTC, datetime

from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit.context import set_audit_actor
from app.core.exceptions import DomainError
from app.models.checkin import Checkin, ManagerComment
from app.models.enums import AuditAction, SheetStatus, UserRole
from app.models.user import User
from app.repositories.checkins import CheckinRepository
from app.repositories.goals import GoalRepository
from app.repositories.users import UserRepository
from app.schemas.goal import CheckinUpsert
from app.services.audit_service import AuditService
from app.services.score_service import ScoreService


class CheckinService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.checkins = CheckinRepository(db)
        self.goals = GoalRepository(db)
        self.users = UserRepository(db)
        self.score = ScoreService()
        self.audit = AuditService(db)

    async def upsert(self, actor: User, payload: CheckinUpsert) -> Checkin:
        goal = await self.goals.get_goal(payload.goal_id)
        if goal is None:
            raise DomainError("Goal not found.", status_code=status.HTTP_404_NOT_FOUND)
        sheet = await self.goals.get_sheet(goal.goal_sheet_id)
        if sheet is None or sheet.user_id != actor.id:
            raise DomainError(
                "You can only check in against your own goals.", status_code=status.HTTP_403_FORBIDDEN
            )
        if sheet.status != SheetStatus.locked:
            raise DomainError(
                "Goals must be approved and locked before check-ins can be submitted.",
                status_code=status.HTTP_409_CONFLICT,
            )

        set_audit_actor(actor.id)
        score = self.score.compute(
            uom_type=goal.uom_type,
            target=goal.target,
            target_date=goal.target_date,
            actual_value=payload.actual_value,
            actual_date=payload.actual_date,
        )
        checkin = await self.checkins.get_for_goal_quarter(payload.goal_id, payload.quarter)
        if checkin is None:
            checkin = Checkin(goal_id=payload.goal_id, quarter=payload.quarter, updated_at=datetime.now(UTC))
            self.db.add(checkin)
        checkin.planned_value = payload.planned_value
        checkin.actual_value = payload.actual_value
        checkin.actual_date = payload.actual_date
        checkin.progress_score = score.score
        checkin.status = payload.status
        checkin.updated_at = datetime.now(UTC)
        await self.audit.record(
            entity_type="checkins",
            entity_id=checkin.id,
            action=AuditAction.checkin_save,
            actor_id=actor.id,
            new_value={"quarter": payload.quarter.value, "score": str(score.score), "formula": score.formula},
        )
        await self.db.flush()
        return checkin

    async def add_manager_comment(self, checkin_id, actor: User, comment: str) -> ManagerComment:
        checkin = await self.db.get(Checkin, checkin_id)
        if checkin is None:
            raise DomainError("Check-in not found.", status_code=status.HTTP_404_NOT_FOUND)
        goal = await self.goals.get_goal(checkin.goal_id)
        sheet = await self.goals.get_sheet(goal.goal_sheet_id) if goal else None
        owner = await self.users.get(sheet.user_id) if sheet else None
        if actor.role != UserRole.admin and (
            actor.role != UserRole.manager or owner is None or owner.manager_id != actor.id
        ):
            raise DomainError(
                "You are not allowed to comment on this check-in.", status_code=status.HTTP_403_FORBIDDEN
            )
        set_audit_actor(actor.id)
        manager_comment = ManagerComment(
            checkin_id=checkin.id,
            manager_id=actor.id,
            comment=comment.strip(),
            created_at=datetime.now(UTC),
        )
        self.db.add(manager_comment)
        await self.audit.record(
            entity_type="manager_comments",
            entity_id=manager_comment.id,
            action=AuditAction.comment,
            actor_id=actor.id,
            new_value={"checkin_id": str(checkin.id)},
        )
        await self.db.flush()
        return manager_comment
