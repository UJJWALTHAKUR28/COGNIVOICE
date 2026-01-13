import os
import logging
from dotenv import load_dotenv

load_dotenv()  # This loads the .env file

logger = logging.getLogger(__name__)

class Settings:
    MONGO_URL: str = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    def __init__(self):
        if not self.SECRET_KEY:
            logger.warning("SECRET_KEY not set! Using insecure default. Set SECRET_KEY in .env for production.")
            self.SECRET_KEY = "dev-only-insecure-secret-key-change-in-production"

settings = Settings()
 