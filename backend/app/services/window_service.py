from datetime import UTC, datetime

from fastapi import status

from app.core.exceptions import DomainError
from app.models.cycle import Cycle
from app.models.enums import Quarter


class CycleWindowService:
    def goal_window_is_open(self, cycle: Cycle, now: datetime | None = None) -> bool:
        current = now or datetime.now(UTC)
        return cycle.goal_window_open <= current <= cycle.goal_window_close

    def active_quarter(self, cycle: Cycle, now: datetime | None = None) -> Quarter | None:
        current = now or datetime.now(UTC)
        if current >= cycle.q4_open:
            return Quarter.Q4
        if current >= cycle.q3_open:
            return Quarter.Q3
        if current >= cycle.q2_open:
            return Quarter.Q2
        if current >= cycle.q1_open:
            return Quarter.Q1
        return None

    def assert_goal_window_open(self, cycle: Cycle) -> None:
        if self.goal_window_is_open(cycle):
            return
        raise DomainError(
            "Goal submission window is closed for this cycle. Contact an admin to reopen or unlock the cycle.",
            status_code=status.HTTP_409_CONFLICT,
            code="goal_window_closed",
        )

    def assert_quarter_open(self, cycle: Cycle, quarter: Quarter) -> None:
        active = self.active_quarter(cycle)
        if active == quarter:
            return
        active_label = active.value if active else "not open"
        raise DomainError(
            f"{quarter.value} check-ins are not open for this cycle. Current quarter window is {active_label}.",
            status_code=status.HTTP_409_CONFLICT,
            code="quarter_window_closed",
        )
