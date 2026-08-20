import asyncio
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import async_session
from app.domain.tables.models import Table
from app.domain.menu.models import MenuItem

async def seed():
    async with async_session() as db:
        table = Table(id=12, table_number=12, current_session_id="sess_123")
        db.add(table)
        
        for i in range(1, 16):
            item = MenuItem(
                id=i,
                name=f"Mock Item {i}",
                description="Mock",
                price=9.99,
                category="Mock",
                image_url=f"/menu/{i}.png",
                is_active=True
            )
            db.add(item)
            
        try:
            await db.commit()
            print("Successfully seeded database with Table 12 and Menu Items 1-15.")
        except Exception as e:
            print("Error during seeding (maybe already seeded?):", e)

if __name__ == "__main__":
    asyncio.run(seed())
