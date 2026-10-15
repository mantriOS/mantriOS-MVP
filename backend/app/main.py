import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from dotenv import load_dotenv

# Ensure backend/.env is reliably loaded regardless of current working directory
backend_dir = Path(__file__).resolve().parent.parent
env_file = backend_dir / ".env"
load_dotenv(dotenv_path=env_file)
load_dotenv()


from app.api.email_webhook import router as email_webhook_router
from app.api.petitions import router as petitions_router
from app.api.email_branding import router as email_branding_router

app = FastAPI(
    title="AI Petition Processing System",
    description="FastAPI service for processing citizen petitions via Zapier & Gemini AI",
    version="1.0.0",
)

frontend_origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(email_webhook_router)
app.include_router(petitions_router)
app.include_router(email_branding_router)

