from fastapi import APIRouter

from app.api.v1 import admin, analytics, auth, checkins, goals, manager, reports

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(goals.router)
api_router.include_router(manager.router)
api_router.include_router(checkins.router)
api_router.include_router(admin.router)
api_router.include_router(analytics.router)
api_router.include_router(reports.router)
