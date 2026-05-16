"""Create tables (SQLite/local dev). For PostgreSQL production, use Alembic."""

from app.database import Base, engine
from app.models import AuditLog, Checkin, Cycle, Goal, GoalSheet, ManagerComment, User  # noqa: F401


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    print("Database tables created")


if __name__ == "__main__":
    init_db()
