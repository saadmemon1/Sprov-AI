# Sprov-AI API

This is the FastAPI backend for audio analysis.

- Deployed on: Render.
- Handles audio uploads, analysis, and (optionally) Gemini feedback.

## How to Run Locally

```bash
cd api
pip install -r requirements.txt
uvicorn main_api:app --reload
```

## How to Deploy
See the main repo README for Render deployment instructions. 