from pydantic import BaseModel


class DashboardMetric(BaseModel):
    label: str
    value: str | int | float
    delta: str | None = None


class OrgAnalyticsOut(BaseModel):
    completion_rate: float
    submitted_sheets: int
    approved_sheets: int
    locked_sheets: int
    metrics: list[DashboardMetric]
