from dataclasses import dataclass
from decimal import Decimal

from fastapi import status

from app.core.exceptions import DomainError
from app.models.goal import Goal

MIN_GOAL_WEIGHT = Decimal("10")
MAX_GOALS = 8
REQUIRED_TOTAL_WEIGHT = Decimal("100")


@dataclass(frozen=True)
class WeightageValidationResult:
    total: Decimal
    remaining: Decimal
    goal_count: int
    is_valid: bool
    message: str


class GoalValidationService:
    def summarize_weightage(self, goals: list[Goal]) -> WeightageValidationResult:
        total = sum((goal.weightage for goal in goals), Decimal("0"))
        remaining = REQUIRED_TOTAL_WEIGHT - total
        is_valid = (
            total == REQUIRED_TOTAL_WEIGHT
            and len(goals) <= MAX_GOALS
            and all(goal.weightage >= MIN_GOAL_WEIGHT for goal in goals)
        )
        if total < REQUIRED_TOTAL_WEIGHT:
            message = f"Current total weightage is {total}%. Add {abs(remaining)}% more before submission."
        elif total > REQUIRED_TOTAL_WEIGHT:
            message = f"Current total weightage is {total}%. Reduce {abs(remaining)}% before submission."
        else:
            message = "Weightage is exactly 100%. This goal sheet is ready to submit."
        return WeightageValidationResult(total, remaining, len(goals), is_valid, message)

    def validate_for_submission(self, goals: list[Goal]) -> WeightageValidationResult:
        if not goals:
            raise DomainError(
                "Add at least one goal before submitting.", status_code=status.HTTP_400_BAD_REQUEST
            )
        if len(goals) > MAX_GOALS:
            overage = len(goals) - MAX_GOALS
            raise DomainError(
                f"Maximum {MAX_GOALS} goals are allowed. Remove {overage} goal(s) before submitting.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        for goal in goals:
            if goal.weightage < MIN_GOAL_WEIGHT:
                raise DomainError(
                    f"Goal '{goal.title}' has {goal.weightage}% weightage. Minimum goal weightage is 10%.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
        result = self.summarize_weightage(goals)
        if result.total != REQUIRED_TOTAL_WEIGHT:
            raise DomainError(
                result.message, status_code=status.HTTP_400_BAD_REQUEST, code="invalid_weightage_total"
            )
        return result
