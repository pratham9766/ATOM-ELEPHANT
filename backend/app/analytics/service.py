from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import SheetStatus
from app.models.goal_sheet import GoalSheet
from app.schemas.analytics import DashboardMetric, OrgAnalyticsOut


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
        )

    async def _count_by_status(self, status: SheetStatus) -> int:
        count = await self.db.scalar(select(func.count(GoalSheet.id)).where(GoalSheet.status == status))
        return count or 0
