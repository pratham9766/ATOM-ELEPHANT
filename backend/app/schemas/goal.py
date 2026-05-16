from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.enums import CheckinStatus, GoalStatus, Quarter, SheetStatus, UomType
from app.schemas.common import ORMModel


class GoalBase(BaseModel):
    title: str = Field(min_length=3, max_length=300)
    description: str | None = Field(default=None, max_length=500)
    thrust_area: str = Field(min_length=2, max_length=200)
    uom_type: UomType
    target: Decimal | None = None
    target_date: date | None = None
    weightage: Decimal = Field(ge=Decimal("10"), le=Decimal("100"))
    is_shared: bool = False


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    version: int
    title: str | None = Field(default=None, min_length=3, max_length=300)
    description: str | None = Field(default=None, max_length=500)
    thrust_area: str | None = Field(default=None, min_length=2, max_length=200)
    uom_type: UomType | None = None
    target: Decimal | None = None
    target_date: date | None = None
    weightage: Decimal | None = Field(default=None, ge=Decimal("10"), le=Decimal("100"))
    is_shared: bool | None = None


class GoalOut(ORMModel):
    id: UUID
    goal_sheet_id: UUID
    title: str
    description: str | None
    thrust_area: str
    uom_type: UomType
    target: Decimal | None
    target_date: date | None
    weightage: Decimal
    is_shared: bool
    status: GoalStatus
    position: int
    version: int
    created_at: datetime
    updated_at: datetime


class GoalSheetCreate(BaseModel):
    cycle_id: UUID | None = None


class SubmitSheetRequest(BaseModel):
    version: int


class ReturnForReworkRequest(BaseModel):
    comment: str = Field(min_length=5, max_length=1000)


class GoalSheetOut(ORMModel):
    id: UUID
    user_id: UUID
    cycle_id: UUID
    status: SheetStatus
    submitted_at: datetime | None
    approved_at: datetime | None
    approved_by: UUID | None
    locked_at: datetime | None
    rework_comment: str | None
    version: int
    goals: list[GoalOut] = []
    created_at: datetime
    updated_at: datetime


class WeightageSummary(BaseModel):
    total: Decimal
    remaining: Decimal
    goal_count: int
    is_valid: bool
    message: str


class CheckinUpsert(BaseModel):
    goal_id: UUID
    quarter: Quarter
    planned_value: Decimal | None = None
    actual_value: Decimal | None = None
    actual_date: date | None = None
    status: CheckinStatus = CheckinStatus.on_track


class CheckinOut(ORMModel):
    id: UUID
    goal_id: UUID
    quarter: Quarter
    planned_value: Decimal | None
    actual_value: Decimal | None
    actual_date: date | None
    progress_score: Decimal | None
    status: CheckinStatus
    updated_at: datetime


class ManagerCommentCreate(BaseModel):
    comment: str = Field(min_length=3, max_length=2000)


class ManagerCommentOut(ORMModel):
    id: UUID
    checkin_id: UUID
    manager_id: UUID
    comment: str
    created_at: datetime
