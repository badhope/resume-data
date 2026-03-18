from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    APP_NAME: str = "简历数据清洗系统"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024
    
    DATABASE_URL: str = "sqlite:///./resume.db"
    
    REDIS_URL: str = "redis://localhost:6379/0"
    
    ALLOWED_EXTENSIONS: list = [".pdf", ".docx", ".doc", ".txt", ".html"]
    
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
