"""add escalation rules and events

Revision ID: 002_escalations
Revises: 001_initial_schema
Create Date: 2026-05-16
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "002_escalations"
down_revision: str | None = "001_initial_schema"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "escalation_rules",
        sa.Column("cycle_id", sa.Uuid(), nullable=False),
        sa.Column(
            "trigger_type",
            sa.Enum("not_submitted", "not_approved", "checkin_missing", name="escalation_trigger", native_enum=False),
            nullable=False,
        ),
        sa.Column("threshold_days", sa.SmallInteger(), nullable=False),
        sa.Column(
            "notify_level",
            sa.Enum("employee", "manager", "hr", name="escalation_level", native_enum=False),
            nullable=False,
        ),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["cycle_id"], ["cycles.id"], name=op.f("fk_escalation_rules_cycle_id_cycles")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_escalation_rules")),
    )
    op.create_index(op.f("ix_escalation_rules_cycle_id"), "escalation_rules", ["cycle_id"], unique=False)

    op.create_table(
        "escalation_events",
        sa.Column("rule_id", sa.Uuid(), nullable=False),
        sa.Column("target_user_id", sa.Uuid(), nullable=False),
        sa.Column("fired_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("resolved_by", sa.Uuid(), nullable=True),
        sa.Column(
            "status",
            sa.Enum("open", "resolved", name="escalation_status", native_enum=False),
            nullable=False,
        ),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(["resolved_by"], ["users.id"], name=op.f("fk_escalation_events_resolved_by_users")),
        sa.ForeignKeyConstraint(["rule_id"], ["escalation_rules.id"], name=op.f("fk_escalation_events_rule_id_escalation_rules")),
        sa.ForeignKeyConstraint(["target_user_id"], ["users.id"], name=op.f("fk_escalation_events_target_user_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_escalation_events")),
    )
    op.create_index(op.f("ix_escalation_events_target_user_id"), "escalation_events", ["target_user_id"], unique=False)


def downgrade() -> None:
    op.drop_table("escalation_events")
    op.drop_table("escalation_rules")
