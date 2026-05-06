from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime, timezone
from app.database.connection import Base

class ScanHistory(Base):
    __tablename__ = "scan_history"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    media_type = Column(String) # 'image', 'video', 'url', 'webcam'
    authenticity_score = Column(Float)
    fake_probability = Column(Float)
    risk_level = Column(String)
    explanation = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
