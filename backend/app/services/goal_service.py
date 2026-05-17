from datetime import UTC, datetime
from uuid import UUID

from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession

from app.audit.context import set_audit_actor
from app.core.exceptions import DomainError
from app.models.cycle import Cycle
from app.models.enums import AuditAction, GoalStatus, SheetStatus, UserRole
from app.models.goal import Goal
from app.models.goal_sheet import GoalSheet
from app.models.user import User
from app.repositories.goals import GoalRepository
from app.repositories.users import UserRepository
from app.schemas.goal import GoalCreate, GoalUpdate, SharedGoalCreate
from app.services.audit_service import AuditService
from app.services.validation_service import GoalValidationService, WeightageValidationResult
from app.services.window_service import CycleWindowService
from app.workflows.state_machine import GoalSheetWorkflow


class GoalService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = GoalRepository(db)
        self.users = UserRepository(db)
        self.audit = AuditService(db)
        self.workflow = GoalSheetWorkflow()
        self.validator = GoalValidationService()
        self.windows = CycleWindowService()

    async def get_active_cycle(self) -> Cycle:
        cycle = await self.repo.active_cycle()
        if cycle is None:
            raise DomainError("No active cycle is configured.", status_code=status.HTTP_404_NOT_FOUND)
        return cycle

    async def get_or_create_sheet(self, user: User, cycle_id: UUID | None = None) -> GoalSheet:
        cycle = await self.db.get(Cycle, cycle_id) if cycle_id else await self.get_active_cycle()
        if cycle is None:
            raise DomainError("Cycle not found.", status_code=status.HTTP_404_NOT_FOUND)
        sheet = await self.repo.get_sheet_for_user_cycle(user.id, cycle.id)
        if sheet:
            return sheet
        set_audit_actor(user.id)
        sheet = GoalSheet(user_id=user.id, cycle_id=cycle.id, status=SheetStatus.draft)
        sheet.user = user
        sheet.cycle = cycle
        self.db.add(sheet)
        await self.db.flush()
        await self.db.refresh(sheet, ["goals"])
        return sheet

    async def authorize_sheet_access(self, sheet_id: UUID, actor: User) -> GoalSheet:
        sheet = await self.repo.get_sheet(sheet_id)
        if sheet is None:
            raise DomainError("Goal sheet not found.", status_code=status.HTTP_404_NOT_FOUND)
        if sheet.user_id == actor.id or actor.role == UserRole.admin:
            return sheet
        if actor.role == UserRole.manager:
            owner = await self.users.get(sheet.user_id)
            if owner and owner.manager_id == actor.id:
                return sheet
        raise DomainError(
            "You are not allowed to access this goal sheet.", status_code=status.HTTP_403_FORBIDDEN
        )

    def summarize_weightage(self, sheet: GoalSheet) -> WeightageValidationResult:
        return self.validator.summarize_weightage(sheet.goals)

    async def add_goal(self, sheet: GoalSheet, actor: User, payload: GoalCreate) -> Goal:
        if sheet.user_id != actor.id:
            raise DomainError("Only the sheet owner can add goals.", status_code=status.HTTP_403_FORBIDDEN)
        self.windows.assert_goal_window_open(sheet.cycle)
        if sheet.status not in (SheetStatus.draft, SheetStatus.rework):
            raise DomainError(
                f"Sheet is {sheet.status.value}; goals cannot be added now.",
                status_code=status.HTTP_409_CONFLICT,
            )
        summary = self.validator.summarize_weightage(sheet.goals)
        if summary.goal_count >= 8:
            raise DomainError("Maximum 8 goals reached. Remove a goal before adding another.")
        set_audit_actor(actor.id)
        goal = Goal(goal_sheet_id=sheet.id, position=summary.goal_count + 1, **payload.model_dump())
        goal.checkins = []
        self.db.add(goal)
        sheet.version += 1
        await self.db.flush()
        await self.db.refresh(goal, ["created_at", "updated_at"])
        return goal

    async def update_goal(self, sheet: GoalSheet, goal_id: UUID, actor: User, payload: GoalUpdate) -> Goal:
        goal = await self.repo.get_goal(goal_id)
        if goal is None or goal.goal_sheet_id != sheet.id:
            raise DomainError("Goal not found.", status_code=status.HTTP_404_NOT_FOUND)
        if sheet.version != payload.version:
            raise DomainError(
                "Sheet was updated by someone else. Reload and retry.", status_code=status.HTTP_409_CONFLICT
            )
        if sheet.status in (SheetStatus.approved, SheetStatus.locked) and actor.role != UserRole.admin:
            raise DomainError(
                "Approved or locked goals are read-only without admin unlock.",
                status_code=status.HTTP_409_CONFLICT,
            )
        if sheet.status == SheetStatus.submitted and actor.role == UserRole.employee:
            raise DomainError(
                "Submitted goals are pending manager approval and cannot be edited.",
                status_code=status.HTTP_409_CONFLICT,
            )

        data = payload.model_dump(exclude_unset=True, exclude={"version"})
        if goal.is_shared and actor.role == UserRole.employee:
            blocked = {"title", "target", "target_date", "uom_type", "thrust_area", "is_shared"}
            if blocked.intersection(data):
                raise DomainError(
                    "Shared goal title, target, and measurement settings are controlled by a manager or admin.",
                    status_code=status.HTTP_403_FORBIDDEN,
                    code="shared_goal_read_only",
                )
        if actor.role == UserRole.employee and sheet.status in (SheetStatus.draft, SheetStatus.rework):
            self.windows.assert_goal_window_open(sheet.cycle)
        set_audit_actor(actor.id)
        for field, value in data.items():
            setattr(goal, field, value)
        goal.version += 1
        sheet.version += 1
        await self.db.flush()
        await self.db.refresh(goal, ["updated_at"])
        return goal

    async def delete_goal(self, sheet: GoalSheet, goal_id: UUID, actor: User) -> None:
        goal = await self.repo.get_goal(goal_id)
        if goal is None or goal.goal_sheet_id != sheet.id:
            raise DomainError("Goal not found.", status_code=status.HTTP_404_NOT_FOUND)
        if sheet.user_id != actor.id:
            raise DomainError("Only the sheet owner can remove goals.", status_code=status.HTTP_403_FORBIDDEN)
        self.windows.assert_goal_window_open(sheet.cycle)
        if sheet.status not in (SheetStatus.draft, SheetStatus.rework):
            raise DomainError(
                f"Sheet is {sheet.status.value}; goals cannot be removed now.",
                status_code=status.HTTP_409_CONFLICT,
            )
        set_audit_actor(actor.id)
        await self.db.delete(goal)
        sheet.version += 1
        await self.db.flush()

    async def submit(self, sheet: GoalSheet, actor: User, version: int) -> GoalSheet:
        if sheet.user_id != actor.id:
            raise DomainError("Only the sheet owner can submit.", status_code=status.HTTP_403_FORBIDDEN)
        if sheet.version != version:
            raise DomainError(
                "Sheet version mismatch. Reload and retry.", status_code=status.HTTP_409_CONFLICT
            )
        self.workflow.validate(sheet.status, SheetStatus.submitted, actor.role)
        self.windows.assert_goal_window_open(sheet.cycle)
        self.validator.validate_for_submission(sheet.goals)
        set_audit_actor(actor.id)
        old = {"status": sheet.status.value}
        sheet.status = SheetStatus.submitted
        sheet.submitted_at = datetime.now(UTC)
        sheet.rework_comment = None
        sheet.version += 1
        await self.audit.record(
            entity_type="goal_sheets",
            entity_id=sheet.id,
            action=AuditAction.submit,
            actor_id=actor.id,
            old_value=old,
            new_value={"status": sheet.status.value},
        )
        await self.db.flush()
        await self.db.refresh(sheet, ["updated_at"])
        return sheet

    async def approve(self, sheet: GoalSheet, actor: User) -> GoalSheet:
        await self._assert_manager_for_sheet(sheet, actor)
        self.workflow.validate(sheet.status, SheetStatus.approved, actor.role)
        self.validator.validate_for_submission(sheet.goals)
        set_audit_actor(actor.id)
        old = {"status": sheet.status.value}
        now = datetime.now(UTC)
        sheet.status = SheetStatus.locked
        sheet.approved_at = now
        sheet.approved_by = actor.id
        sheet.locked_at = now
        sheet.version += 1
        for goal in sheet.goals:
            goal.status = GoalStatus.locked
            goal.version += 1
        await self.audit.record(
            entity_type="goal_sheets",
            entity_id=sheet.id,
            action=AuditAction.approve,
            actor_id=actor.id,
            old_value=old,
            new_value={"status": "locked", "approved_by": str(actor.id)},
        )
        await self.db.flush()
        await self.db.refresh(sheet, ["updated_at"])
        for goal in sheet.goals:
            await self.db.refresh(goal, ["updated_at"])
        return sheet

    async def return_for_rework(self, sheet: GoalSheet, actor: User, comment: str) -> GoalSheet:
        await self._assert_manager_for_sheet(sheet, actor)
        self.workflow.validate(sheet.status, SheetStatus.rework, actor.role)
        set_audit_actor(actor.id)
        old = {"status": sheet.status.value}
        sheet.status = SheetStatus.rework
        sheet.rework_comment = comment.strip()
        sheet.version += 1
        await self.audit.record(
            entity_type="goal_sheets",
            entity_id=sheet.id,
            action=AuditAction.return_for_rework,
            actor_id=actor.id,
            old_value=old,
            new_value={"status": "rework", "comment": comment.strip()},
        )
        await self.db.flush()
        await self.db.refresh(sheet, ["updated_at"])
        return sheet

    async def admin_unlock(self, sheet: GoalSheet, actor: User, reason: str) -> GoalSheet:
        self.workflow.validate(
            sheet.status, SheetStatus.rework, actor.role
        ) if sheet.status == SheetStatus.locked else None
        if actor.role != UserRole.admin:
            raise DomainError("Only admins can unlock goal sheets.", status_code=status.HTTP_403_FORBIDDEN)
        set_audit_actor(actor.id)
        old = {"status": sheet.status.value}
        sheet.status = SheetStatus.rework
        sheet.locked_at = None
        sheet.version += 1
        for goal in sheet.goals:
            goal.status = GoalStatus.active
            goal.version += 1
        await self.audit.record(
            entity_type="goal_sheets",
            entity_id=sheet.id,
            action=AuditAction.admin_unlock,
            actor_id=actor.id,
            old_value=old,
            new_value={"status": "rework", "reason": reason},
        )
        await self.db.flush()
        await self.db.refresh(sheet, ["updated_at"])
        for goal in sheet.goals:
            await self.db.refresh(goal, ["updated_at"])
        return sheet

    async def team_submissions(self, manager: User) -> list[GoalSheet]:
        return await self.repo.team_submissions(manager.id)

    async def create_shared_goal(self, actor: User, payload: SharedGoalCreate) -> list[Goal]:
        if actor.role not in (UserRole.manager, UserRole.admin):
            raise DomainError("Only managers and admins can create shared goals.", status_code=status.HTTP_403_FORBIDDEN)
        cycle = await self.get_active_cycle()
        self.windows.assert_goal_window_open(cycle)
        target_users = await self.users.direct_reports(actor.id) if actor.role == UserRole.manager else await self.users.active_employees()
        if payload.target_user_ids:
            allowed_ids = {user.id for user in target_users}
            target_users = [user for user in target_users if user.id in set(payload.target_user_ids) and user.id in allowed_ids]
        if not target_users:
            raise DomainError("No eligible employees found for the shared goal.", status_code=status.HTTP_400_BAD_REQUEST)

        shared_key = f"shared-{datetime.now(UTC).strftime('%Y%m%d%H%M%S%f')}"
        created: list[Goal] = []
        data = payload.model_dump(exclude={"target_user_ids"})
        for user in target_users:
            sheet = await self.get_or_create_sheet(user, cycle.id)
            if sheet.status not in (SheetStatus.draft, SheetStatus.rework):
                continue
            summary = self.validator.summarize_weightage(sheet.goals)
            if summary.goal_count >= 8:
                continue
            if summary.remaining < payload.weightage:
                continue
            goal = Goal(
                goal_sheet_id=sheet.id,
                position=summary.goal_count + 1,
                shared_goal_key=shared_key,
                **{**data, "is_shared": True},
            )
            goal.checkins = []
            self.db.add(goal)
            sheet.version += 1
            created.append(goal)
        if not created:
            raise DomainError("Shared goal could not be added because all target sheets are locked or full.")
        await self.db.flush()
        for goal in created:
            await self.db.refresh(goal, ["created_at", "updated_at"])
        return created

    async def _assert_manager_for_sheet(self, sheet: GoalSheet, actor: User) -> None:
        if actor.role == UserRole.admin:
            return
        if actor.role != UserRole.manager:
            raise DomainError("Only managers can perform this action.", status_code=status.HTTP_403_FORBIDDEN)
        owner = await self.users.get(sheet.user_id)
        if owner is None or owner.manager_id != actor.id:
            raise DomainError(
                "This employee is not one of your direct reports.", status_code=status.HTTP_403_FORBIDDEN
            )
