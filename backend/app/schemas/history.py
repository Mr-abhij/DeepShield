from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ScanHistoryBase(BaseModel):
    filename: str
    media_type: str
    authenticity_score: float
    fake_probability: float
    risk_level: str
    explanation: str

class ScanHistoryCreate(ScanHistoryBase):
    pass

class ScanHistoryResponse(ScanHistoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
