from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

mongo_client = AsyncIOMotorClient(settings.MONGO_URL)
db = mongo_client["voice_emotion_db"]
users_collection = db["users"]
audio_clips_collection = db["audio_clips"] 