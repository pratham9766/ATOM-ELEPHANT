"""Drop and recreate local SQLite database."""

from pathlib import Path

from app.database import Base, engine
from app.models import AuditLog, Checkin, Cycle, Goal, GoalSheet, ManagerComment, User  # noqa: F401

db_path = Path("elephant.db")
if db_path.exists():
    db_path.unlink()
    print("Removed elephant.db")

Base.metadata.create_all(bind=engine)
print("Recreated tables")
