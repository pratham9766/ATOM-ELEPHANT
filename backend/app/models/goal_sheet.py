from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Text, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import SheetStatus

if TYPE_CHECKING:
    from app.models.cycle import Cycle
    from app.models.goal import Goal
    from app.models.user import User


class GoalSheet(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "goal_sheets"
    __table_args__ = (UniqueConstraint("user_id", "cycle_id", name="uq_goal_sheet_user_cycle"),)

    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id"), nullable=False, index=True)
    cycle_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("cycles.id"), nullable=False, index=True)
    status: Mapped[SheetStatus] = mapped_column(
        Enum(SheetStatus, name="sheet_status", native_enum=False), nullable=False, default=SheetStatus.draft
    )
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    approved_by: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("users.id"), nullable=True)
    locked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    rework_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    user: Mapped[User] = relationship("User", foreign_keys=[user_id], overlaps="goal_sheets")
    approver: Mapped[User | None] = relationship("User", foreign_keys=[approved_by])
    cycle: Mapped[Cycle] = relationship("Cycle", back_populates="goal_sheets")
    goals: Mapped[list[Goal]] = relationship(
        "Goal", back_populates="goal_sheet", cascade="all, delete-orphan", lazy="selectin"
    )
