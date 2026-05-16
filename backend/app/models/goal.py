from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Date, Enum, ForeignKey, Integer, Numeric, SmallInteger, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import GoalStatus, UomType

if TYPE_CHECKING:
    from app.models.checkin import Checkin
    from app.models.goal_sheet import GoalSheet


class Goal(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "goals"

    goal_sheet_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("goal_sheets.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    thrust_area: Mapped[str] = mapped_column(String(200), nullable=False)
    uom_type: Mapped[UomType] = mapped_column(
        Enum(UomType, name="uom_type", native_enum=False), nullable=False
    )
    target: Mapped[Decimal | None] = mapped_column(Numeric(15, 4), nullable=True)
    target_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    weightage: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    is_shared: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    status: Mapped[GoalStatus] = mapped_column(
        Enum(GoalStatus, name="goal_status", native_enum=False), nullable=False, default=GoalStatus.draft
    )
    position: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=1)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    goal_sheet: Mapped[GoalSheet] = relationship("GoalSheet", back_populates="goals")
    checkins: Mapped[list[Checkin]] = relationship(
        "Checkin", back_populates="goal", cascade="all, delete-orphan", lazy="selectin"
    )
