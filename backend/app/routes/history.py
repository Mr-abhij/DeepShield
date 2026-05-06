from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.models.history import ScanHistory
from app.schemas.history import ScanHistoryResponse

router = APIRouter()

@router.get("/history", response_model=List[ScanHistoryResponse], tags=["History"])
def get_history(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    records = db.query(ScanHistory).order_by(ScanHistory.created_at.desc()).offset(skip).limit(limit).all()
    return records

@router.delete("/history/{id}", tags=["History"])
def delete_history(id: int, db: Session = Depends(get_db)):
    record = db.query(ScanHistory).filter(ScanHistory.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()
    return {"success": True, "message": "Record deleted"}
