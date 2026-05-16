from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.goal_sheet import GoalSheet


class Cycle(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "cycles"

    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    goal_window_open: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    goal_window_close: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    q1_open: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    q2_open: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    q3_open: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    q4_open: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)

    goal_sheets: Mapped[list[GoalSheet]] = relationship("GoalSheet", back_populates="cycle")
