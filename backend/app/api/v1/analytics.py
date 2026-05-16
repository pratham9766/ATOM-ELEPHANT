from typing import Annotated

from fastapi import APIRouter, Depends

from app.analytics.service import AnalyticsService
from app.core.deps import DbSession, require_roles
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.analytics import OrgAnalyticsOut

router = APIRouter(prefix="/analytics", tags=["analytics"])
AnalyticsUser = Annotated[User, Depends(require_roles([UserRole.manager, UserRole.admin]))]


@router.get("/org-summary", response_model=OrgAnalyticsOut)
async def org_summary(db: DbSession, _: AnalyticsUser) -> OrgAnalyticsOut:
    return await AnalyticsService(db).org_summary()
