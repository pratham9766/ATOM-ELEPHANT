from fastapi import status
from jose import JWTError
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import DomainError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    parse_subject,
    verify_password,
)
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.users import UserRepository


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.users = UserRepository(db)

    async def authenticate(self, email: str, password: str) -> tuple[User, str, str]:
        user = await self.users.get_by_email(email)
        if user is None or not verify_password(password, user.password_hash):
            raise DomainError(
                "Invalid email or password.", status_code=status.HTTP_401_UNAUTHORIZED, code="invalid_login"
            )
        claims = {"role": user.role.value, "email": user.email}
        return user, create_access_token(user.id, claims), create_refresh_token(user.id, claims)

    async def demo_login(self, role: UserRole) -> tuple[User, str, str]:
        demo_profiles = {
            UserRole.employee: ("Arjun Mehta", "arjun.employee@elephant.demo", "Product Engineering"),
            UserRole.manager: ("Sunita Rao", "sunita.manager@elephant.demo", "Product Engineering"),
            UserRole.admin: ("Rajan Kapoor", "rajan.admin@elephant.demo", "People Operations"),
        }
        name, email, department = demo_profiles[role]
        user = await self.users.get_by_email(email)
        if user is None:
            user = User(
                name=name,
                email=email,
                role=role,
                department=department,
                password_hash=hash_password("ElephantDemo123!"),
            )
            self.db.add(user)
            try:
                await self.db.flush()
            except IntegrityError:
                await self.db.rollback()
                user = await self.users.get_by_email(email)
                if user is None:
                    raise
        claims = {"role": user.role.value, "email": user.email, "demo": True}
        return user, create_access_token(user.id, claims), create_refresh_token(user.id, claims)

    async def refresh(self, refresh_token: str) -> tuple[User, str, str]:
        try:
            payload = decode_token(refresh_token, expected_type="refresh")
            user_id = parse_subject(payload)
        except (JWTError, ValueError) as exc:
            raise DomainError("Invalid refresh token.", status_code=status.HTTP_401_UNAUTHORIZED) from exc
        user = await self.users.get(user_id)
        if user is None or not user.is_active:
            raise DomainError("User not found or inactive.", status_code=status.HTTP_401_UNAUTHORIZED)
        claims = {"role": user.role.value, "email": user.email}
        return user, create_access_token(user.id, claims), create_refresh_token(user.id, claims)
