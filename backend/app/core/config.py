import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Absolute path to the nyaya-ai root directory (4 levels up from this file)
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
ENV_FILE_PATH = ROOT_DIR / ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str = "NyayaAI"
    API_V1_STR: str = "/api/v1"
    
    # JWT Auth Config
    JWT_SECRET: str = "supersecretkey"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Database
    MONGODB_URL: str = ""
    DATABASE_URL: str = ""
    DATABASE_NAME: str = "nyaya_ai"
    
    # 3rd Party APIs
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-20b"
    RESEND_API_KEY: str = ""
    GOOGLE_CLIENT_ID: str = ""

    class Config:
        case_sensitive = True
        env_file = str(ENV_FILE_PATH)
        extra = "ignore"

settings = Settings()
