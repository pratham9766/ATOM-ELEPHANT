"""add shared goal grouping key

Revision ID: 003_shared_goal_key
Revises: 002_escalations
Create Date: 2026-05-17
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "003_shared_goal_key"
down_revision: str | None = "002_escalations"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("goals", sa.Column("shared_goal_key", sa.String(length=80), nullable=True))
    op.create_index(op.f("ix_goals_shared_goal_key"), "goals", ["shared_goal_key"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_goals_shared_goal_key"), table_name="goals")
    op.drop_column("goals", "shared_goal_key")
