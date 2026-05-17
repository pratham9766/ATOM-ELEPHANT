from pydantic import BaseModel


class DashboardMetric(BaseModel):
    label: str
    value: str | int | float
    delta: str | None = None


class DepartmentMetric(BaseModel):
    department: str
    completion_rate: float
    submitted: int
    locked: int
    total: int


class ThrustAreaMetric(BaseModel):
    thrust_area: str
    weightage: float
    goals: int


class ManagerEffectivenessMetric(BaseModel):
    manager: str
    direct_reports: int
    submitted_sheets: int
    locked_sheets: int
    effectiveness_rate: float


class OrgAnalyticsOut(BaseModel):
    completion_rate: float
    submitted_sheets: int
    approved_sheets: int
    locked_sheets: int
    metrics: list[DashboardMetric]
    departments: list[DepartmentMetric] = []
    thrust_areas: list[ThrustAreaMetric] = []
    manager_effectiveness: list[ManagerEffectivenessMetric] = []
