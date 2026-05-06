from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()

@router.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "running",
        "platform": "SynthGuard AI",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
