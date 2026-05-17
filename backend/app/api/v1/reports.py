from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import Response

from app.core.deps import DbSession, require_roles
from app.models.enums import UserRole
from app.models.user import User
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["reports"])
ReportUser = Annotated[User, Depends(require_roles([UserRole.manager, UserRole.admin]))]


@router.get("/achievement.csv")
async def achievement_report_csv(db: DbSession, _: ReportUser) -> Response:
    content = await ReportService(db).achievement_csv()
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="elephant-achievement-report.csv"'},
    )


@router.get("/completion-summary")
async def completion_summary(db: DbSession, _: ReportUser) -> dict:
    return await ReportService(db).completion_summary()
