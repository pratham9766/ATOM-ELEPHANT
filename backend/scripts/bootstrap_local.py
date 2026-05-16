"""Create tables locally (SQLite) when PostgreSQL/Docker is unavailable."""

import asyncio

from app.db.base import Base
from app.db.session import engine
from app.models import (  # noqa: F401
    AuditLog,
    Checkin,
    Cycle,
    EscalationEvent,
    EscalationRule,
    Goal,
    GoalSheet,
    ManagerComment,
    User,
)


async def main() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Local database tables ready")


if __name__ == "__main__":
    asyncio.run(main())
