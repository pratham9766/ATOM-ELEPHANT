from fastapi import APIRouter

from app.core.deps import CurrentUser, DbSession
from app.schemas.auth import CurrentUserOut, DemoLoginRequest, LoginRequest, RefreshRequest, TokenPair
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenPair)
async def login(body: LoginRequest, db: DbSession) -> TokenPair:
    _, access_token, refresh_token = await AuthService(db).authenticate(body.email, body.password)
    return TokenPair(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenPair)
async def refresh(body: RefreshRequest, db: DbSession) -> TokenPair:
    _, access_token, refresh_token = await AuthService(db).refresh(body.refresh_token)
    return TokenPair(access_token=access_token, refresh_token=refresh_token)


@router.post("/demo-login", response_model=TokenPair)
async def demo_login(body: DemoLoginRequest, db: DbSession) -> TokenPair:
    _, access_token, refresh_token = await AuthService(db).demo_login(body.role)
    await db.commit()
    return TokenPair(access_token=access_token, refresh_token=refresh_token)


@router.get("/me", response_model=CurrentUserOut)
async def me(current_user: CurrentUser) -> CurrentUserOut:
    return CurrentUserOut.model_validate(current_user)
