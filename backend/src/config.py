import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "ResolveML — Business Entity Resolution API"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Database: Supports PostgreSQL or local SQLite
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./backend/entity_resolution.db")
    
    DATA_DIR: str = os.getenv("DATA_DIR", "./backend/data")
    MODELS_DIR: str = os.getenv("MODELS_DIR", "./backend/models")
    OUTPUT_DIR: str = os.getenv("OUTPUT_DIR", "./backend/outputs")
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Ensure directories exist
os.makedirs(settings.DATA_DIR, exist_ok=True)
os.makedirs(settings.MODELS_DIR, exist_ok=True)
os.makedirs(settings.OUTPUT_DIR, exist_ok=True)
