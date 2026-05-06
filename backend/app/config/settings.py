import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    MAX_VIDEO_FRAMES = int(os.getenv("MAX_VIDEO_FRAMES", "30"))
    MODEL_NAME = os.getenv("MODEL_NAME", "prithivMLmods/Deep-Fake-Detector-Model")
    DATABASE_URL = "sqlite:///./truthlens.db"
    UPLOADS_DIR = "uploads"
    TEMP_FRAMES_DIR = "temp_frames"
    HEATMAPS_DIR = "app/static/heatmaps"

    @classmethod
    def setup_dirs(cls):
        os.makedirs(cls.UPLOADS_DIR, exist_ok=True)
        os.makedirs(cls.TEMP_FRAMES_DIR, exist_ok=True)
        os.makedirs(cls.HEATMAPS_DIR, exist_ok=True)

settings = Settings()
settings.setup_dirs()
