from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.models.enums import SheetStatus
from app.models.goal import Goal
from app.models.goal_sheet import GoalSheet
from app.models.user import User
from app.schemas.analytics import (
    DashboardMetric,
    DepartmentMetric,
    ManagerEffectivenessMetric,
    OrgAnalyticsOut,
    ThrustAreaMetric,
)


class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def org_summary(self) -> OrgAnalyticsOut:
        total = await self.db.scalar(select(func.count(GoalSheet.id))) or 0
        submitted = await self._count_by_status(SheetStatus.submitted)
        approved = await self._count_by_status(SheetStatus.approved)
        locked = await self._count_by_status(SheetStatus.locked)
        completion_rate = (locked / total * 100) if total else 0
        return OrgAnalyticsOut(
            completion_rate=round(completion_rate, 2),
            submitted_sheets=submitted,
            approved_sheets=approved,
            locked_sheets=locked,
            metrics=[
                DashboardMetric(label="Goal sheets", value=total),
                DashboardMetric(label="Submitted", value=submitted),
                DashboardMetric(label="Locked", value=locked),
            ],
            departments=await self._department_metrics(),
            thrust_areas=await self._thrust_area_metrics(),
            manager_effectiveness=await self._manager_effectiveness(),
        )

    async def _count_by_status(self, status: SheetStatus) -> int:
        count = await self.db.scalar(select(func.count(GoalSheet.id)).where(GoalSheet.status == status))
        return count or 0

    async def _department_metrics(self) -> list[DepartmentMetric]:
        department = func.coalesce(User.department, "Unassigned")
        rows = (
            await self.db.execute(
                select(
                    department,
                    func.count(GoalSheet.id),
                    func.count(GoalSheet.id).filter(GoalSheet.status == SheetStatus.submitted),
                    func.count(GoalSheet.id).filter(GoalSheet.status == SheetStatus.locked),
                )
                .join(GoalSheet, GoalSheet.user_id == User.id)
                .group_by(department)
                .order_by(department)
            )
        ).all()
        return [
            DepartmentMetric(
                department=department,
                total=total,
                submitted=submitted,
                locked=locked,
                completion_rate=round((locked / total * 100), 2) if total else 0,
            )
            for department, total, submitted, locked in rows
        ]

    async def _thrust_area_metrics(self) -> list[ThrustAreaMetric]:
        rows = (
            await self.db.execute(
                select(Goal.thrust_area, func.coalesce(func.sum(Goal.weightage), 0), func.count(Goal.id))
                .group_by(Goal.thrust_area)
                .order_by(func.count(Goal.id).desc())
            )
        ).all()
        return [
            ThrustAreaMetric(thrust_area=area, weightage=float(weightage), goals=count)
            for area, weightage, count in rows
        ]

    async def _manager_effectiveness(self) -> list[ManagerEffectivenessMetric]:
        employee = aliased(User)
        rows = (
            await self.db.execute(
                select(
                    User.name,
                    func.count(GoalSheet.id),
                    func.count(GoalSheet.id).filter(GoalSheet.status == SheetStatus.submitted),
                    func.count(GoalSheet.id).filter(GoalSheet.status == SheetStatus.locked),
                )
                .join(employee, employee.manager_id == User.id)
                .join(GoalSheet, GoalSheet.user_id == employee.id)
                .group_by(User.id, User.name)
                .order_by(User.name)
            )
        ).all()
        return [
            ManagerEffectivenessMetric(
                manager=name,
                direct_reports=total,
                submitted_sheets=submitted,
                locked_sheets=locked,
                effectiveness_rate=round(((submitted + locked) / total * 100), 2) if total else 0,
            )
            for name, total, submitted, locked in rows
        ]
