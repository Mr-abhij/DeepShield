from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import logging
import time

from app.config.settings import settings
from app.database.connection import engine, Base
from app.routes import analyze, history, health

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s"
)
logger = logging.getLogger(__name__)

# Create DB tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SynthGuard AI",
    description="AI-powered Deepfake Detection and Media Authenticity Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time"],
)

# ── Request timing middleware ─────────────────────────────────────────────────
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed = time.perf_counter() - start
    response.headers["X-Process-Time"] = f"{elapsed:.4f}s"
    return response

# ── Global error handler ─────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "detail": "Internal Server Error",
            "error": str(exc),
        }
    )

# ── Static files (heatmaps) ───────────────────────────────────────────────────
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(health.router,   prefix="/api")
app.include_router(analyze.router,  prefix="/api")
app.include_router(history.router,  prefix="/api")
