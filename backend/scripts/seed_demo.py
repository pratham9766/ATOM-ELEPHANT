import asyncio

from app.db.session import AsyncSessionLocal
from app.services.demo_seed_service import DemoSeedService


async def main() -> None:
    async with AsyncSessionLocal() as db:
        result = await DemoSeedService(db).seed()
        await db.commit()
        print(result)


if __name__ == "__main__":
    asyncio.run(main())
