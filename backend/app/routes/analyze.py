import os
import uuid
import re
import aiofiles
import cv2
import numpy as np
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.database.connection import get_db
from app.models.history import ScanHistory
from app.schemas.analysis import AnalysisResponse, UrlScanRequest
from app.services.image_service import image_service
from app.services.video_service import video_service
from app.services.url_service import url_service

router = APIRouter()

# ── Security constants ────────────────────────────────────────────────────────
MAX_IMAGE_SIZE_MB = 20
MAX_VIDEO_SIZE_MB = 200
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska"}
SAFE_FILENAME_RE = re.compile(r"^[\w\-. ]+$")


def _safe_ext(filename: str) -> str:
    """Return a safe lowercase extension from the original filename."""
    parts = filename.rsplit(".", 1)
    ext = parts[-1].lower() if len(parts) == 2 else "bin"
    if not re.match(r"^[a-z0-9]{1,10}$", ext):
        ext = "bin"
    return ext


def _validate_image(file: UploadFile, content: bytes):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported image type: {file.content_type}. Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}")
    mb = len(content) / (1024 * 1024)
    if mb > MAX_IMAGE_SIZE_MB:
        raise HTTPException(status_code=413, detail=f"Image too large ({mb:.1f} MB). Max allowed: {MAX_IMAGE_SIZE_MB} MB.")


def _validate_video(file: UploadFile, content: bytes):
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported video type: {file.content_type}. Allowed: {', '.join(ALLOWED_VIDEO_TYPES)}")
    mb = len(content) / (1024 * 1024)
    if mb > MAX_VIDEO_SIZE_MB:
        raise HTTPException(status_code=413, detail=f"Video too large ({mb:.1f} MB). Max allowed: {MAX_VIDEO_SIZE_MB} MB.")


def store_history(db: Session, filename: str, media_type: str, result: dict):
    try:
        record = ScanHistory(
            filename=filename[:255],
            media_type=media_type,
            authenticity_score=result["authenticity_score"],
            fake_probability=result["fake_probability"],
            risk_level=result["risk_level"],
            explanation=result["explanation"],
        )
        db.add(record)
        db.commit()
    except Exception as e:
        db.rollback()
        import logging
        logging.getLogger(__name__).error(f"Failed to store history: {e}")


# ── Image ─────────────────────────────────────────────────────────────────────
@router.post("/analyze-image", response_model=AnalysisResponse, tags=["Analysis"])
async def analyze_image_endpoint(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    _validate_image(file, content)

    ext = _safe_ext(file.filename or "upload.jpg")
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(settings.UPLOADS_DIR, filename)

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)

    try:
        img = cv2.imread(filepath)
        if img is None:
            raise HTTPException(status_code=400, detail="Cannot decode image. File may be corrupted.")
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        result = image_service.analyze_image(img_rgb, filepath)
        store_history(db, file.filename or filename, "image", result)
        return result
    finally:
        # Keep upload for heatmap references; clean temp frames only
        pass


# ── Video ─────────────────────────────────────────────────────────────────────
@router.post("/analyze-video", response_model=AnalysisResponse, tags=["Analysis"])
async def analyze_video_endpoint(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    _validate_video(file, content)

    ext = _safe_ext(file.filename or "upload.mp4")
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(settings.UPLOADS_DIR, filename)

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)

    try:
        result = video_service.analyze_video(filepath)
        store_history(db, file.filename or filename, "video", result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video analysis failed: {str(e)}")
    finally:
        pass


# ── Webcam (fast path, no DB) ─────────────────────────────────────────────────
@router.post("/webcam-scan", response_model=AnalysisResponse, tags=["Analysis"])
async def webcam_scan_endpoint(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid frame content type.")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty frame received.")

    nparr = np.frombuffer(content, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Cannot decode webcam frame.")

    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    try:
        result = image_service.analyze_image(img_rgb)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Webcam analysis failed: {str(e)}")


# ── URL scan ──────────────────────────────────────────────────────────────────
@router.post("/scan-url", response_model=AnalysisResponse, tags=["Analysis"])
async def scan_url_endpoint(request: UrlScanRequest, db: Session = Depends(get_db)):
    url = request.image_url.strip()
    # Basic URL sanity check
    if not url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="URL must start with http:// or https://")

    try:
        result = await url_service.analyze_url(url)
        store_history(db, url[:255], "url", result)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"URL scan failed: {str(e)}")
