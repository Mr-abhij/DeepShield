# TruthLens AI Backend

This is the production-grade FastAPI backend for TruthLens AI, an AI-powered Deepfake Detection and Media Authenticity Platform.

## Features

- **Image & Video Deepfake Detection**: Uses HuggingFace `prithivMLmods/Deep-Fake-Detector-Model`.
- **Ensemble Scoring Engine**: Aggregates Model Confidence, Face Consistency (MTCNN), Artifact Analysis (OpenCV Laplacian/ELA), and Metadata Analysis (piexif).
- **Explainable AI**: Rule-based NLP to generate human-readable reports.
- **Heatmap Visualization**: Generates pseudo-heatmaps highlighting manipulated regions.
- **REST APIs**: Fast, async endpoints for images, videos, live webcam, and URLs.
- **Database**: SQLite with SQLAlchemy for Scan History.

## Setup & Installation

### Prerequisites
- Python 3.9+
- ffmpeg (required for video processing)

### Local Installation
1. Clone the repository and navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
3. Install PyTorch (CPU-only recommended for development speed):
   ```bash
   pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
   ```
4. Install remaining requirements:
   ```bash
   pip install -r requirements.txt
   ```
5. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

### Running the Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 10000 --reload
```

The API docs will be available at: http://localhost:10000/docs

## API Endpoints

- `GET /api/health`
- `POST /api/analyze-image` (multipart/form-data with `file`)
- `POST /api/analyze-video` (multipart/form-data with `file`)
- `POST /api/webcam-scan` (multipart/form-data with `file`)
- `POST /api/scan-url` (JSON body: `{"image_url": "..."}`)
- `GET /api/history`
- `DELETE /api/history/{id}`

## Deployment (Render)

This project is configured for easy deployment on Render using `render.yaml`. It automatically installs `ffmpeg` and uses the `Procfile` for the start command.
