"""Seed hackathon demo data: 1 admin, 2 managers × 5 reports, 1 active cycle."""

from datetime import UTC, datetime

from sqlalchemy import select

from app.database import SessionLocal
from app.models.cycle import Cycle
from app.models.enums import UserRole
from app.models.user import User

THRUST_AREAS = ["Revenue Growth", "Operational Excellence", "Customer Success", "Innovation"]


def seed() -> None:
    db = SessionLocal()
    try:
        if db.scalar(select(User).limit(1)):
            print("Database already seeded — skipping")
            return

        admin = User(
            name="Rajan HR",
            email="rajan.admin@elephant.dev",
            role=UserRole.admin,
            department="People Operations",
        )
        db.add(admin)
        db.flush()

        managers = []
        for idx, (name, email, dept) in enumerate(
            [
                ("Sunita Lead", "sunita.manager@elephant.dev", "Engineering"),
                ("Vikram Lead", "vikram.manager@elephant.dev", "Revenue"),
            ],
            start=1,
        ):
            manager = User(name=name, email=email, role=UserRole.manager, department=dept)
            db.add(manager)
            db.flush()
            managers.append(manager)

            for emp_idx in range(1, 6):
                employee = User(
                    name=f"Employee {idx}.{emp_idx}",
                    email=f"emp{idx}{emp_idx}@elephant.dev",
                    role=UserRole.employee,
                    manager_id=manager.id,
                    department=dept,
                )
                db.add(employee)

        db.flush()

        # Demo employee from PRD persona
        arjun = User(
            name="Arjun Engineer",
            email="arjun.employee@elephant.dev",
            role=UserRole.employee,
            manager_id=managers[0].id,
            department="Engineering",
        )
        db.add(arjun)

        cycle = Cycle(
            name="FY2025-26",
            goal_window_open=datetime(2025, 5, 1, tzinfo=UTC),
            goal_window_close=datetime(2025, 6, 30, tzinfo=UTC),
            q1_open=datetime(2025, 7, 1, tzinfo=UTC),
            q2_open=datetime(2025, 10, 1, tzinfo=UTC),
            q3_open=datetime(2026, 1, 1, tzinfo=UTC),
            q4_open=datetime(2026, 3, 1, tzinfo=UTC),
            is_active=True,
            created_by=admin.id,
        )
        db.add(cycle)
        db.commit()

        print("Seed complete")
        print("Admin:", admin.email)
        print("Managers:", ", ".join(m.email for m in managers))
        print("Demo employee:", arjun.email)
    finally:
        db.close()


if __name__ == "__main__":
    seed()
