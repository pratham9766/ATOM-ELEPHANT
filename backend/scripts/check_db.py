"""Verify PostgreSQL connectivity and that migrations have been applied."""

import asyncio

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import get_settings


async def main() -> None:
    settings = get_settings()
    engine = create_async_engine(
        settings.database_url,
        connect_args=settings.async_db_connect_args,
        pool_pre_ping=True,
    )
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            table_exists = (
                await conn.execute(text("SELECT to_regclass('public.users') IS NOT NULL"))
            ).scalar()
        print("OK: database connection successful")
        print(f"URL: {settings.database_url}")
        if table_exists:
            print("OK: schema present (users table exists)")
        else:
            print("WARN: users table missing — run: python -m alembic upgrade head")
    except Exception as exc:
        print("FAIL: cannot connect to database")
        print(f"Error: {exc}")
        print("\nNext steps:")
        print("  1. Install Docker Desktop, then: docker compose up -d")
        print("  2. Or install PostgreSQL and update DATABASE_URL in backend/.env")
        print("  3. Run: python -m alembic upgrade head")
        print("  4. Run: python scripts/seed_demo.py")
        raise SystemExit(1) from exc
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
