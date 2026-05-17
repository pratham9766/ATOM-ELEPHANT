from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.models.enums import AuditAction, EscalationLevel, EscalationStatus, EscalationTrigger, UserRole
from app.schemas.common import ORMModel


class CycleCreate(BaseModel):
    name: str = Field(min_length=3, max_length=100)
    goal_window_open: datetime
    goal_window_close: datetime
    q1_open: datetime
    q2_open: datetime
    q3_open: datetime
    q4_open: datetime
    is_active: bool = False


class CycleOut(ORMModel):
    id: UUID
    name: str
    goal_window_open: datetime
    goal_window_close: datetime
    q1_open: datetime
    q2_open: datetime
    q3_open: datetime
    q4_open: datetime
    is_active: bool


class UserOut(ORMModel):
    id: UUID
    name: str
    email: EmailStr
    role: UserRole
    manager_id: UUID | None
    department: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class UserUpdate(BaseModel):
    role: UserRole | None = None
    manager_id: UUID | None = None
    department: str | None = Field(default=None, max_length=200)
    is_active: bool | None = None


class AdminUnlockRequest(BaseModel):
    reason: str = Field(min_length=8, max_length=1000)


class AuditLogOut(ORMModel):
    id: UUID
    entity_type: str
    entity_id: UUID
    action: AuditAction
    old_value: dict | None
    new_value: dict | None
    changed_by: UUID | None
    timestamp: datetime


class EscalationRuleCreate(BaseModel):
    cycle_id: UUID
    trigger_type: EscalationTrigger
    threshold_days: int = Field(ge=1, le=60)
    notify_level: EscalationLevel
    is_active: bool = True


class EscalationRuleOut(ORMModel):
    id: UUID
    cycle_id: UUID
    trigger_type: EscalationTrigger
    threshold_days: int
    notify_level: EscalationLevel
    is_active: bool


class EscalationEventOut(ORMModel):
    id: UUID
    rule_id: UUID
    target_user_id: UUID
    fired_at: datetime
    resolved_at: datetime | None
    resolved_by: UUID | None
    status: EscalationStatus
