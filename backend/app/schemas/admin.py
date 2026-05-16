from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.enums import AuditAction
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
