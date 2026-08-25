from motor.motor_asyncio import AsyncIOMotorClient  # type: ignore
from app.core.config import settings

client = AsyncIOMotorClient(settings.MONGODB_URL)
db = client[settings.DATABASE_NAME]

def get_db():
    return db
