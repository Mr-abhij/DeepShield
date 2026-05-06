# SynthGuard AI — Deepfake Detection & Media Forensics Platform

<div align="center">

![SynthGuard Banner](https://img.shields.io/badge/SynthGuard-AI_Forensics-00f0ff?style=for-the-badge&logo=shield&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![PyTorch](https://img.shields.io/badge/PyTorch-CPU-EE4C2C?style=for-the-badge&logo=pytorch)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

> **SynthGuard AI** is a full-stack, production-grade deepfake detection and media authenticity platform powered by a multi-layered AI forensic engine — built for security analysts, media fact-checkers, and hackathon judges.

</div>

---

## 🧠 What It Does

SynthGuard analyzes images, videos, and live webcam feeds using an ensemble of AI models to determine if media has been synthetically generated or manipulated. Every scan produces:

- **Authenticity Score** (0–100)
- **Fake Probability** (%)
- **Risk Level** (Low / Medium / High)
- **AI Explanation** (natural language forensic report)
- **Heatmap Overlay** (attention map of suspicious regions)
- **Metadata Forensics** (EXIF tampering, GPS removal, timestamp anomalies)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React/Vite)                  │
│  Landing → Dashboard → Analysis → Webcam → Vault → Social  │
│  Framer Motion · Recharts · Axios · React Webcam            │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / REST
┌──────────────────────────▼──────────────────────────────────┐
│                     BACKEND (FastAPI)                        │
│  /api/analyze-image  /api/analyze-video  /api/webcam-scan   │
│  /api/scan-url       /api/history        /api/health         │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   AI FORENSIC PIPELINE                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ HuggingFace  │  │    MTCNN     │  │ OpenCV / ELA     │   │
│  │ Deepfake     │  │ Face Detect  │  │ Artifact Scan    │   │
│  │ Transformer  │  │              │  │                  │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│  ┌──────────────┐  ┌──────────────────────────────────────┐  │
│  │    Piexif    │  │      Weighted Scoring Engine         │  │
│  │  Metadata    │  │  50% model · 20% artifact · 20% face │  │
│  │  Forensics   │  │  10% metadata                        │  │
│  └──────────────┘  └──────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    SQLite (local DB)
```

---

## ✨ Feature Set

| Feature | Status |
|---------|--------|
| Image deepfake analysis | ✅ |
| Video frame-by-frame analysis | ✅ |
| Live webcam scan (2s intervals) | ✅ |
| Social media URL scanner | ✅ |
| Heatmap overlay (suspicious regions) | ✅ |
| EXIF/metadata forensics | ✅ |
| Scan history & vault | ✅ |
| Recharts analytics dashboard | ✅ |
| Demo Mode (instant samples) | ✅ |
| Render + Vercel deployment ready | ✅ |

---

## 📁 Project Structure

```
DeepFake Detector/
├── frontend/                    # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── pages/               # Landing, Dashboard, Analysis, Webcam, History, SocialScan
│   │   ├── components/          # Sidebar, Navbar, Footer
│   │   ├── layouts/             # AppLayout (sidebar), MainLayout (landing)
│   │   ├── services/            # api.ts — Axios client, retry logic, typed responses
│   │   └── utils/               # cn() class utility
│   ├── public/
│   │   └── sample.jpg           # Demo scan image
│   ├── .env.local               # VITE_API_URL=http://localhost:8000/api
│   └── vercel.json              # Vercel SPA config
│
└── backend/                     # FastAPI + Python 3.10+
    ├── app/
    │   ├── main.py              # App entry, CORS, middleware
    │   ├── ai/                  # AI modules: deepfake_detector, face_detector, etc.
    │   ├── routes/              # analyze.py, history.py, health.py
    │   ├── services/            # image_service, video_service, url_service
    │   ├── models/              # SQLAlchemy ORM models
    │   ├── schemas/             # Pydantic schemas
    │   ├── config/              # settings.py (env vars)
    │   └── database/            # SQLite connection
    ├── uploads/                 # Uploaded media (gitignored)
    ├── requirements.txt
    ├── Procfile
    ├── render.yaml
    └── .env.example
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- `ffmpeg` installed system-wide (for video analysis)

### 1 — Backend

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env         # Edit as needed

# Or use the startup script:
# Windows: start.bat
# Linux/Mac: ./start.sh

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend API docs: http://localhost:8000/docs

### 2 — Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # VITE_API_URL=http://localhost:8000/api
npm run dev
```

Open: http://localhost:5174

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze-image` | Analyze an image file |
| `POST` | `/api/analyze-video` | Analyze a video file (MP4/MOV/AVI) |
| `POST` | `/api/webcam-scan` | Analyze a single webcam frame |
| `POST` | `/api/scan-url` | Scan a public image URL |
| `GET` | `/api/history` | Get scan history |
| `DELETE` | `/api/history/{id}` | Delete a history record |
| `GET` | `/api/health` | Health check |

### Example Response

```json
{
  "success": true,
  "authenticity_score": 23.4,
  "fake_probability": 76.6,
  "risk_level": "High",
  "explanation": "GAN-generated textures detected in periocular region...",
  "heatmap_url": "/static/heatmaps/abc123_heatmap.jpg",
  "metadata_flags": ["EXIF data removed", "GPS coordinates stripped"],
  "analysis": {
    "face_consistency": 18.2,
    "texture_score": 34.1,
    "artifact_score": 12.8
  }
}
```

---

## 🌐 Deployment

### Frontend → Vercel

```bash
cd frontend
npm install -g vercel
vercel --prod
# Set VITE_API_URL to your Render backend URL in Vercel dashboard
```

### Backend → Render

1. Push the `backend/` folder to GitHub
2. Connect repo to Render
3. Set **Build Command** and **Start Command** as per `render.yaml`
4. Add environment variables in Render dashboard

---

## 🔒 Security Features

- File type validation (MIME + magic bytes via OpenCV decode)
- Upload size limits (20 MB images / 200 MB videos)
- Sanitized filenames (UUID-based, no user input in paths)
- CORS whitelist per environment
- SQLite local-only (not exposed externally)
- DB in `.gitignore` (user privacy preserved)

---

## 🛣️ Future Scope

- [ ] Audio deepfake detection (voice cloning)
- [ ] Browser extension for social media scanning
- [ ] Blockchain-anchored authenticity certificates
- [ ] Multi-face tracking in videos
- [ ] API key authentication for enterprise access
- [ ] Webhook integrations for CMS platforms

---

## 🏆 Built For

> Hackathon 2025 — AI/ML Track — Media Integrity & Cybersecurity

**Team**: AGL

---

## 📜 License

MIT © 2025 AGL
