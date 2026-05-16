from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from app.models.enums import UomType


@dataclass(frozen=True)
class ScoreResult:
    score: Decimal
    formula: str


class ScoreService:
    def compute(
        self,
        *,
        uom_type: UomType,
        target: Decimal | None,
        target_date: date | None,
        actual_value: Decimal | None,
        actual_date: date | None,
    ) -> ScoreResult:
        if uom_type == UomType.numeric_min:
            if not target or not actual_value:
                return ScoreResult(Decimal("0"), "Missing target or actual value.")
            return ScoreResult(min(actual_value / target, Decimal("1.5")), f"{actual_value} / {target}")
        if uom_type == UomType.numeric_max:
            if not target or not actual_value or actual_value == 0:
                return ScoreResult(Decimal("0"), "Missing values or division by zero guard.")
            return ScoreResult(min(target / actual_value, Decimal("1.5")), f"{target} / {actual_value}")
        if uom_type == UomType.timeline:
            if actual_date is None or target_date is None:
                return ScoreResult(Decimal("0"), "Missing completion date.")
            return ScoreResult(
                Decimal("1") if actual_date <= target_date else Decimal("0"),
                f"{actual_date} <= {target_date}",
            )
        if uom_type == UomType.zero:
            return ScoreResult(Decimal("1") if actual_value == 0 else Decimal("0"), f"{actual_value} == 0")
        return ScoreResult(Decimal("0"), "Unsupported UoM type.")
