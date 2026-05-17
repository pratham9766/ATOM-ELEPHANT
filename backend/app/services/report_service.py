from __future__ import annotations

import csv
from io import StringIO

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.checkin import Checkin
from app.models.goal import Goal
from app.models.goal_sheet import GoalSheet
from app.models.user import User


class ReportService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def achievement_csv(self) -> str:
        stmt = (
            select(User, GoalSheet, Goal, Checkin)
            .join(GoalSheet, GoalSheet.user_id == User.id)
            .join(Goal, Goal.goal_sheet_id == GoalSheet.id)
            .outerjoin(Checkin, Checkin.goal_id == Goal.id)
            .order_by(User.department, User.name, Goal.position, Checkin.quarter)
        )
        rows = (await self.db.execute(stmt)).all()
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(
            [
                "employee",
                "email",
                "department",
                "sheet_status",
                "goal",
                "thrust_area",
                "uom_type",
                "target",
                "weightage",
                "quarter",
                "planned_value",
                "actual_value",
                "actual_date",
                "progress_score",
                "checkin_status",
            ]
        )
        for user, sheet, goal, checkin in rows:
            writer.writerow(
                [
                    user.name,
                    user.email,
                    user.department or "",
                    sheet.status.value,
                    goal.title,
                    goal.thrust_area,
                    goal.uom_type.value,
                    goal.target or "",
                    goal.weightage,
                    checkin.quarter.value if checkin else "",
                    checkin.planned_value if checkin else "",
                    checkin.actual_value if checkin else "",
                    checkin.actual_date if checkin else "",
                    checkin.progress_score if checkin else "",
                    checkin.status.value if checkin else "",
                ]
            )
        return output.getvalue()

    async def completion_summary(self) -> dict:
        sheets = (
            await self.db.execute(
                select(GoalSheet)
                .options(
                    selectinload(GoalSheet.goals).selectinload(Goal.checkins),
                    selectinload(GoalSheet.user),
                )
                .order_by(GoalSheet.updated_at.desc())
            )
        ).scalars().unique().all()
        total_goals = sum(len(sheet.goals) for sheet in sheets)
        total_checkins = sum(len(goal.checkins) for sheet in sheets for goal in sheet.goals)
        return {
            "goal_sheets": len(sheets),
            "goals": total_goals,
            "checkins": total_checkins,
            "checkin_completion_rate": round((total_checkins / total_goals * 100), 2) if total_goals else 0,
        }
