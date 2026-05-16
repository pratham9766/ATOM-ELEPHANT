import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, SmallInteger, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import EscalationLevel, EscalationStatus, EscalationTrigger


class EscalationRule(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "escalation_rules"

    cycle_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("cycles.id"), nullable=False, index=True)
    trigger_type: Mapped[EscalationTrigger] = mapped_column(
        Enum(EscalationTrigger, name="escalation_trigger", native_enum=False),
        nullable=False,
    )
    threshold_days: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    notify_level: Mapped[EscalationLevel] = mapped_column(
        Enum(EscalationLevel, name="escalation_level", native_enum=False),
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    events: Mapped[list["EscalationEvent"]] = relationship(
        "EscalationEvent",
        back_populates="rule",
        cascade="all, delete-orphan",
    )


class EscalationEvent(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "escalation_events"

    rule_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("escalation_rules.id"), nullable=False)
    target_user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )
    fired_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    resolved_by: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("users.id"), nullable=True)
    status: Mapped[EscalationStatus] = mapped_column(
        Enum(EscalationStatus, name="escalation_status", native_enum=False),
        nullable=False,
        default=EscalationStatus.open,
    )

    rule: Mapped[EscalationRule] = relationship("EscalationRule", back_populates="events")
