from dataclasses import dataclass

from fastapi import status

from app.core.exceptions import DomainError
from app.models.enums import AuditAction, SheetStatus, UserRole


@dataclass(frozen=True)
class Transition:
    source: SheetStatus
    target: SheetStatus
    action: AuditAction
    allowed_roles: tuple[UserRole, ...]


class GoalSheetWorkflow:
    transitions: dict[tuple[SheetStatus, SheetStatus], Transition] = {
        (SheetStatus.draft, SheetStatus.submitted): Transition(
            SheetStatus.draft, SheetStatus.submitted, AuditAction.submit, (UserRole.employee,)
        ),
        (SheetStatus.rework, SheetStatus.submitted): Transition(
            SheetStatus.rework, SheetStatus.submitted, AuditAction.submit, (UserRole.employee,)
        ),
        (SheetStatus.submitted, SheetStatus.approved): Transition(
            SheetStatus.submitted,
            SheetStatus.approved,
            AuditAction.approve,
            (UserRole.manager, UserRole.admin),
        ),
        (SheetStatus.submitted, SheetStatus.rework): Transition(
            SheetStatus.submitted,
            SheetStatus.rework,
            AuditAction.return_for_rework,
            (UserRole.manager, UserRole.admin),
        ),
        (SheetStatus.approved, SheetStatus.locked): Transition(
            SheetStatus.approved, SheetStatus.locked, AuditAction.lock, (UserRole.manager, UserRole.admin)
        ),
        (SheetStatus.locked, SheetStatus.rework): Transition(
            SheetStatus.locked, SheetStatus.rework, AuditAction.admin_unlock, (UserRole.admin,)
        ),
    }

    def validate(self, source: SheetStatus, target: SheetStatus, actor_role: UserRole) -> Transition:
        transition = self.transitions.get((source, target))
        if transition is None:
            raise DomainError(
                f"Cannot transition goal sheet from {source.value} to {target.value}.",
                status_code=status.HTTP_409_CONFLICT,
                code="invalid_workflow_transition",
            )
        if actor_role not in transition.allowed_roles:
            raise DomainError(
                f"Role {actor_role.value} cannot perform {source.value} to {target.value}.",
                status_code=status.HTTP_403_FORBIDDEN,
                code="workflow_permission_denied",
            )
        return transition
