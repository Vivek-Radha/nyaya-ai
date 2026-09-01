from motor.motor_asyncio import AsyncIOMotorClient  # type: ignore
from app.core.config import settings
import os

mongo_url = settings.MONGODB_URL or settings.DATABASE_URL or os.getenv("MONGODB_URL") or os.getenv("DATABASE_URL") or "mongodb://localhost:27017"

client = AsyncIOMotorClient(mongo_url)
db = client[settings.DATABASE_NAME]

def get_db():
    return db
