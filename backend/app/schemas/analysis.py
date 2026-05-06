from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class AnalysisDetails(BaseModel):
    face_consistency: float
    texture_score: float
    artifact_score: float

class AnalysisResponse(BaseModel):
    success: bool
    authenticity_score: float
    fake_probability: float
    risk_level: str
    explanation: str
    heatmap_url: Optional[str] = None
    metadata_flags: List[str] = []
    analysis: AnalysisDetails

class UrlScanRequest(BaseModel):
    image_url: str
