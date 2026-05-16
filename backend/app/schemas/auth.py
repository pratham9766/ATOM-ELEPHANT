from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.models.enums import UserRole
from app.schemas.common import ORMModel


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class RefreshRequest(BaseModel):
    refresh_token: str


class DemoLoginRequest(BaseModel):
    role: UserRole


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class CurrentUserOut(ORMModel):
    id: UUID
    name: str
    email: EmailStr
    role: UserRole
    manager_id: UUID | None
    department: str | None
