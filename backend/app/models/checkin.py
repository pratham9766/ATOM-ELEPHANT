from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Numeric, Text, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, UUIDPrimaryKeyMixin
from app.models.enums import CheckinStatus, Quarter

if TYPE_CHECKING:
    from app.models.goal import Goal


class Checkin(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "checkins"
    __table_args__ = (UniqueConstraint("goal_id", "quarter", name="uq_checkin_goal_quarter"),)

    goal_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("goals.id"), nullable=False, index=True)
    quarter: Mapped[Quarter] = mapped_column(Enum(Quarter, name="quarter", native_enum=False), nullable=False)
    planned_value: Mapped[Decimal | None] = mapped_column(Numeric(15, 4), nullable=True)
    actual_value: Mapped[Decimal | None] = mapped_column(Numeric(15, 4), nullable=True)
    actual_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    progress_score: Mapped[Decimal | None] = mapped_column(Numeric(7, 4), nullable=True)
    status: Mapped[CheckinStatus] = mapped_column(
        Enum(CheckinStatus, name="checkin_status", native_enum=False),
        nullable=False,
        default=CheckinStatus.not_started,
    )
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    goal: Mapped[Goal] = relationship("Goal", back_populates="checkins")
    comments: Mapped[list[ManagerComment]] = relationship(
        "ManagerComment", back_populates="checkin", cascade="all, delete-orphan", lazy="selectin"
    )


class ManagerComment(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "manager_comments"

    checkin_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("checkins.id"), nullable=False, index=True)
    manager_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id"), nullable=False)
    comment: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    checkin: Mapped[Checkin] = relationship("Checkin", back_populates="comments")
