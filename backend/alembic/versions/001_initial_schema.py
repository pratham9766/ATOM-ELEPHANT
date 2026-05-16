"""initial enterprise schema

Revision ID: 001_initial_schema
Revises:
Create Date: 2026-05-16
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001_initial_schema"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=True),
        sa.Column("entra_id", sa.String(length=200), nullable=True),
        sa.Column("role", sa.Enum("employee", "manager", "admin", name="user_role", native_enum=False), nullable=False),
        sa.Column("manager_id", sa.Uuid(), nullable=True),
        sa.Column("department", sa.String(length=200), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["manager_id"], ["users.id"], name=op.f("fk_users_manager_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_users")),
        sa.UniqueConstraint("email", name=op.f("uq_users_email")),
        sa.UniqueConstraint("entra_id", name=op.f("uq_users_entra_id")),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=False)

    op.create_table(
        "cycles",
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("goal_window_open", sa.DateTime(timezone=True), nullable=False),
        sa.Column("goal_window_close", sa.DateTime(timezone=True), nullable=False),
        sa.Column("q1_open", sa.DateTime(timezone=True), nullable=False),
        sa.Column("q2_open", sa.DateTime(timezone=True), nullable=False),
        sa.Column("q3_open", sa.DateTime(timezone=True), nullable=False),
        sa.Column("q4_open", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_cycles")),
        sa.UniqueConstraint("name", name=op.f("uq_cycles_name")),
    )
    op.create_index(op.f("ix_cycles_is_active"), "cycles", ["is_active"], unique=False)

    op.create_table(
        "audit_logs",
        sa.Column("entity_type", sa.String(length=80), nullable=False),
        sa.Column("entity_id", sa.Uuid(), nullable=False),
        sa.Column(
            "action",
            sa.Enum(
                "create",
                "update",
                "submit",
                "approve",
                "return_for_rework",
                "lock",
                "admin_unlock",
                "checkin_save",
                "comment",
                name="audit_action",
                native_enum=False,
            ),
            nullable=False,
        ),
        sa.Column("old_value", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("new_value", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("changed_by", sa.Uuid(), nullable=True),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(["changed_by"], ["users.id"], name=op.f("fk_audit_logs_changed_by_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_audit_logs")),
    )
    op.create_index(op.f("ix_audit_logs_changed_by"), "audit_logs", ["changed_by"], unique=False)
    op.create_index(op.f("ix_audit_logs_entity_id"), "audit_logs", ["entity_id"], unique=False)
    op.create_index(op.f("ix_audit_logs_entity_type"), "audit_logs", ["entity_type"], unique=False)

    op.create_table(
        "goal_sheets",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("cycle_id", sa.Uuid(), nullable=False),
        sa.Column(
            "status",
            sa.Enum("draft", "submitted", "rework", "approved", "locked", name="sheet_status", native_enum=False),
            nullable=False,
        ),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_by", sa.Uuid(), nullable=True),
        sa.Column("locked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("rework_comment", sa.Text(), nullable=True),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["approved_by"], ["users.id"], name=op.f("fk_goal_sheets_approved_by_users")),
        sa.ForeignKeyConstraint(["cycle_id"], ["cycles.id"], name=op.f("fk_goal_sheets_cycle_id_cycles")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_goal_sheets_user_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_goal_sheets")),
        sa.UniqueConstraint("user_id", "cycle_id", name="uq_goal_sheet_user_cycle"),
    )
    op.create_index(op.f("ix_goal_sheets_cycle_id"), "goal_sheets", ["cycle_id"], unique=False)
    op.create_index(op.f("ix_goal_sheets_user_id"), "goal_sheets", ["user_id"], unique=False)

    op.create_table(
        "goals",
        sa.Column("goal_sheet_id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(length=300), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("thrust_area", sa.String(length=200), nullable=False),
        sa.Column("uom_type", sa.Enum("numeric_min", "numeric_max", "timeline", "zero", name="uom_type", native_enum=False), nullable=False),
        sa.Column("target", sa.Numeric(precision=15, scale=4), nullable=True),
        sa.Column("target_date", sa.Date(), nullable=True),
        sa.Column("weightage", sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column("is_shared", sa.Boolean(), nullable=False),
        sa.Column("status", sa.Enum("draft", "active", "locked", "archived", name="goal_status", native_enum=False), nullable=False),
        sa.Column("position", sa.SmallInteger(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["goal_sheet_id"], ["goal_sheets.id"], name=op.f("fk_goals_goal_sheet_id_goal_sheets")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_goals")),
    )
    op.create_index(op.f("ix_goals_goal_sheet_id"), "goals", ["goal_sheet_id"], unique=False)

    op.create_table(
        "checkins",
        sa.Column("goal_id", sa.Uuid(), nullable=False),
        sa.Column("quarter", sa.Enum("Q1", "Q2", "Q3", "Q4", name="quarter", native_enum=False), nullable=False),
        sa.Column("planned_value", sa.Numeric(precision=15, scale=4), nullable=True),
        sa.Column("actual_value", sa.Numeric(precision=15, scale=4), nullable=True),
        sa.Column("actual_date", sa.Date(), nullable=True),
        sa.Column("progress_score", sa.Numeric(precision=7, scale=4), nullable=True),
        sa.Column(
            "status",
            sa.Enum("not_started", "on_track", "completed", "reviewed", name="checkin_status", native_enum=False),
            nullable=False,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(["goal_id"], ["goals.id"], name=op.f("fk_checkins_goal_id_goals")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_checkins")),
        sa.UniqueConstraint("goal_id", "quarter", name="uq_checkin_goal_quarter"),
    )
    op.create_index(op.f("ix_checkins_goal_id"), "checkins", ["goal_id"], unique=False)

    op.create_table(
        "manager_comments",
        sa.Column("checkin_id", sa.Uuid(), nullable=False),
        sa.Column("manager_id", sa.Uuid(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.ForeignKeyConstraint(["checkin_id"], ["checkins.id"], name=op.f("fk_manager_comments_checkin_id_checkins")),
        sa.ForeignKeyConstraint(["manager_id"], ["users.id"], name=op.f("fk_manager_comments_manager_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_manager_comments")),
    )
    op.create_index(op.f("ix_manager_comments_checkin_id"), "manager_comments", ["checkin_id"], unique=False)


def downgrade() -> None:
    op.drop_table("manager_comments")
    op.drop_table("checkins")
    op.drop_table("goals")
    op.drop_table("goal_sheets")
    op.drop_table("audit_logs")
    op.drop_table("cycles")
    op.drop_table("users")
