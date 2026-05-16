from datetime import UTC, datetime, timedelta
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.cycle import Cycle
from app.models.enums import EscalationLevel, EscalationTrigger, GoalStatus, SheetStatus, UomType, UserRole
from app.models.escalation import EscalationRule
from app.models.goal import Goal
from app.models.goal_sheet import GoalSheet
from app.models.user import User


class DemoSeedService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def seed(self) -> dict[str, int]:
        existing = await self.db.scalar(select(User).where(User.email == "arjun.employee@elephant.demo"))
        if existing:
            return {"users": 0, "goal_sheets": 0, "goals": 0}

        manager = User(
            name="Sunita Rao",
            email="sunita.manager@elephant.demo",
            role=UserRole.manager,
            department="Product Engineering",
            password_hash=hash_password("ElephantDemo123!"),
        )
        admin = User(
            name="Rajan Kapoor",
            email="rajan.admin@elephant.demo",
            role=UserRole.admin,
            department="People Operations",
            password_hash=hash_password("ElephantDemo123!"),
        )
        self.db.add_all([manager, admin])
        await self.db.flush()

        employees = [
            User(
                name=name,
                email=email,
                role=UserRole.employee,
                department=dept,
                manager_id=manager.id,
                password_hash=hash_password("ElephantDemo123!"),
            )
            for name, email, dept in [
                ("Arjun Mehta", "arjun.employee@elephant.demo", "Product Engineering"),
                ("Priya Shah", "priya.employee@elephant.demo", "Product Engineering"),
                ("Noah Chen", "noah.employee@elephant.demo", "Platform"),
            ]
        ]
        self.db.add_all(employees)
        await self.db.flush()

        now = datetime.now(UTC)
        cycle = Cycle(
            name="FY2026 Enterprise Cycle",
            goal_window_open=now - timedelta(days=20),
            goal_window_close=now + timedelta(days=10),
            q1_open=now + timedelta(days=45),
            q2_open=now + timedelta(days=135),
            q3_open=now + timedelta(days=225),
            q4_open=now + timedelta(days=315),
            is_active=True,
        )
        self.db.add(cycle)
        await self.db.flush()

        sheet_count = 0
        goal_count = 0
        for index, employee in enumerate(employees):
            sheet = GoalSheet(
                user_id=employee.id,
                cycle_id=cycle.id,
                status=SheetStatus.submitted if index < 2 else SheetStatus.locked,
                submitted_at=now - timedelta(days=2 + index),
                approved_at=now - timedelta(days=1) if index == 2 else None,
                approved_by=manager.id if index == 2 else None,
                locked_at=now - timedelta(days=1) if index == 2 else None,
            )
            self.db.add(sheet)
            await self.db.flush()
            sheet_count += 1
            goals = [
                ("Expand enterprise adoption", "Customer Growth", UomType.numeric_min, Decimal("40")),
                ("Improve operating quality", "Operational Excellence", UomType.numeric_max, Decimal("30")),
                ("Strengthen platform governance", "Compliance", UomType.zero, Decimal("30")),
            ]
            for position, (title, thrust, uom, weight) in enumerate(goals, start=1):
                self.db.add(
                    Goal(
                        goal_sheet_id=sheet.id,
                        title=title,
                        description=(
                            f"{employee.name} owns {title.lower()} "
                            "with measurable quarterly outcomes."
                        ),
                        thrust_area=thrust,
                        uom_type=uom,
                        target=Decimal("100"),
                        weightage=weight,
                        status=GoalStatus.locked if sheet.status == SheetStatus.locked else GoalStatus.draft,
                        position=position,
                    )
                )
                goal_count += 1

        self.db.add_all(
            [
                EscalationRule(
                    cycle_id=cycle.id,
                    trigger_type=EscalationTrigger.not_submitted,
                    threshold_days=3,
                    notify_level=EscalationLevel.employee,
                ),
                EscalationRule(
                    cycle_id=cycle.id,
                    trigger_type=EscalationTrigger.not_approved,
                    threshold_days=7,
                    notify_level=EscalationLevel.manager,
                ),
            ]
        )
        await self.db.flush()
        return {"users": len(employees) + 2, "goal_sheets": sheet_count, "goals": goal_count}
