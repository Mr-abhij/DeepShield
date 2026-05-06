#!/bin/bash

echo "Starting SynthGuard Backend..."
echo ""

# Activate virtual environment
source venv/bin/activate

# Start uvicorn server
echo "Starting server on http://localhost:8000"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
