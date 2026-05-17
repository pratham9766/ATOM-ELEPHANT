import re
from functools import lru_cache
from typing import Any, Literal

from pydantic import AnyUrl, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _strip_channel_binding(url: str) -> str:
    return re.sub(r"([?&])channel_binding=[^&]*&?", r"\1", url).rstrip("?&")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "ELEPHANT API"
    environment: Literal["development", "staging", "production", "test"] = "development"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    database_url: str = "postgresql+asyncpg://elephant:elephant@localhost:5432/elephant"
    sync_database_url: str = "postgresql+psycopg://elephant:elephant@localhost:5432/elephant"

    jwt_secret: str = Field(min_length=16, default="dev-change-me-before-production")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_minutes: int = 60 * 24 * 30

    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"
    rate_limit_enabled: bool = True
    rate_limit_requests: int = 100
    rate_limit_window_seconds: int = 60

    @field_validator("database_url")
    @classmethod
    def normalize_async_database_url(cls, value: str) -> str:
        url = _strip_channel_binding(value)
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        if url.startswith("postgresql+psycopg://"):
            url = url.replace("postgresql+psycopg://", "postgresql+asyncpg://", 1)
        # asyncpg expects ssl=, not sslmode=
        url = url.replace("sslmode=require", "ssl=require")
        return url

    @field_validator("sync_database_url")
    @classmethod
    def normalize_sync_database_url(cls, value: str) -> str:
        url = _strip_channel_binding(value)
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        if url.startswith("postgresql+asyncpg://"):
            url = url.replace("postgresql+asyncpg://", "postgresql+psycopg://", 1)
        url = url.replace("ssl=require", "sslmode=require")
        return url

    @property
    def async_db_connect_args(self) -> dict[str, Any]:
        if "ssl=require" in self.database_url or "sslmode=require" in self.database_url:
            return {"ssl": True}
        return {}

    @property
    def sync_db_connect_args(self) -> dict[str, Any]:
        if "sslmode=require" in self.sync_database_url or "ssl=require" in self.sync_database_url:
            return {"sslmode": "require"}
        return {}

    @property
    def cors_origin_list(self) -> list[str | AnyUrl]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
