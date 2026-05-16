from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import UUID

import bcrypt
from jose import JWTError, jwt

from app.core.config import get_settings

settings = get_settings()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, password_hash: str | None) -> bool:
    if not password_hash:
        return False
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


def create_token(
    subject: UUID | str, *, token_type: str, expires_delta: timedelta, claims: dict[str, Any] | None = None
) -> str:
    payload: dict[str, Any] = {
        "sub": str(subject),
        "typ": token_type,
        "exp": datetime.now(UTC) + expires_delta,
        "iat": datetime.now(UTC),
    }
    if claims:
        payload.update(claims)
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_access_token(subject: UUID | str, claims: dict[str, Any] | None = None) -> str:
    return create_token(
        subject,
        token_type="access",
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
        claims=claims,
    )


def create_refresh_token(subject: UUID | str, claims: dict[str, Any] | None = None) -> str:
    return create_token(
        subject,
        token_type="refresh",
        expires_delta=timedelta(minutes=settings.refresh_token_expire_minutes),
        claims=claims,
    )


def decode_token(token: str, *, expected_type: str = "access") -> dict[str, Any]:
    payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    if payload.get("typ") != expected_type:
        raise JWTError("Invalid token type")
    return payload


def parse_subject(token_payload: dict[str, Any]) -> UUID:
    sub = token_payload.get("sub")
    if not sub:
        raise JWTError("Missing subject")
    return UUID(str(sub))
