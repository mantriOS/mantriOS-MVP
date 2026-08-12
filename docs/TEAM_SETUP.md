# PetitionAI — Team Setup and Run Guide

Use this guide after pulling the repository to run the FastAPI backend and Lovable/Vite frontend locally.

## What runs where

| Service | Address | Purpose |
| --- | --- | --- |
| React frontend | `http://localhost:5173` | Dashboard, inbox, departments, analytics, and petition details |
| FastAPI backend | `http://127.0.0.1:8000` | API, Zapier ingestion, Supabase access, and Gemini analysis |
| FastAPI docs | `http://127.0.0.1:8000/docs` | Interactive API testing |

The browser talks only to FastAPI. FastAPI uses the Supabase service key on the server; never add that key to the frontend environment file.

```text
Frontend (5173) → FastAPI (8000) → Supabase
                              └→ Gemini
```

## Prerequisites

- Git
- Node.js 20+ and npm
- Python 3.10+ (Python 3.12 was used during the latest verification)
- A Supabase project containing the existing `petitions` and `analysis` tables
- A Gemini API key

## 1. Clone and install dependencies

From the repository root (`ai_petition_processing_system`):

```powershell
git pull

python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt

cd frontend\petition-wise-main
npm install
cd ..\..
```

If your local `python` command is unavailable, install a supported Python version, or use [uv](https://docs.astral.sh/uv/):

```powershell
uv run --python 3.12 --with-requirements backend\requirements.txt python -c "import fastapi; print('Backend dependencies ready')"
```

## 2. Create environment files

Environment files are ignored by Git. Copy the examples and fill in your own values.

### Backend: `backend/.env`

```dotenv
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Notes:

- Use the Supabase **service role** key only in `backend/.env`.
- Do not commit `.env` files or paste service keys into frontend code.
- The backend is started from the `backend` folder so it reads `backend/.env`.

### Frontend: `frontend/petition-wise-main/.env`

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

Restart Vite whenever this frontend environment file changes.

## 3. Confirm the Supabase schema

This project uses Supabase's REST API directly. It does not run SQLAlchemy migrations. The existing backend expects these columns:

| Table | Required columns |
| --- | --- |
| `petitions` | `id`, `subject`, `body`, `status` |
| `analysis` | `id`, `petition_id`, `summary`, `department_code`, `priority`, `confidence`, `reason` |

`analysis.petition_id` should refer to `petitions.id`. The normal ingestion flow inserts a petition, gets Gemini analysis, inserts an analysis record, then sets petition status to `analysed`.

## 4. Start the backend

Open terminal **1**:

```powershell
cd backend
..\.venv\Scripts\python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

When it starts, open `http://127.0.0.1:8000/docs`.

## 5. Start the frontend

Open terminal **2**:

```powershell
cd frontend\petition-wise-main
npm.cmd run dev
```

Open `http://localhost:5173`.

## 6. Verify that database data reaches the frontend

First verify the backend can read Supabase:

```powershell
Invoke-RestMethod 'http://127.0.0.1:8000/api/v1/petitions?page=1&page_size=20'
```

The response should contain a paginated `items` array with real `petitions` data and, where present, its `analysis` object.

Then refresh the frontend:

- Dashboard uses `GET /api/v1/dashboard`.
- Inbox uses `GET /api/v1/petitions` with search, status, priority, department, and pagination query parameters.
- Petition details use `GET /api/v1/petitions/{id}`.
- Departments and analytics use `GET /api/v1/analytics`.

In browser DevTools → **Network**, confirm requests go to `http://localhost:8000/api/v1/...` and their responses match the numbers and petitions shown in the page.

## 7. Test Gemini end to end

The existing Zapier endpoint can be tested from PowerShell. This creates a real row in Supabase and consumes Gemini API quota.

```powershell
$payload = @{
  subject = 'Test: scholarship payment delay'
  body = 'A student reports an approved education scholarship payment has not been received for four months.'
  headers = @{ source = 'local-test' }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod `
  -Method Post `
  -Uri 'http://127.0.0.1:8000/api/v1/zapier/process-email' `
  -ContentType 'application/json' `
  -Body $payload
```

A successful response includes `petition_id`, `analysis_id`, `summary`, `department_code`, `priority`, `confidence`, and `reason`. Refresh the inbox; the new petition should appear at the top.

## Troubleshooting

### The frontend shows an error or no data

1. Confirm FastAPI is running: open `http://127.0.0.1:8000/docs`.
2. Confirm `VITE_API_BASE_URL=http://localhost:8000` in the frontend `.env`.
3. Confirm `FRONTEND_ORIGINS` includes `http://localhost:5173` in `backend/.env`.
4. Restart both servers after environment changes.
5. Run the `GET /api/v1/petitions` command above. If it fails, inspect the FastAPI terminal first; it will show Supabase credential or connectivity errors.

### Browser reports a CORS error

The frontend URL must exactly match one of the comma-separated `FRONTEND_ORIGINS` values. For example, if Vite is opened at `http://127.0.0.1:5173`, add that exact origin and restart FastAPI.

### Gemini processing fails

- Confirm `GEMINI_API_KEY` is set in `backend/.env`.
- Check the FastAPI terminal output for Gemini error details, quota limits, or model access issues.
- The failed petition is retained with status `analysis_failed` when the initial status update succeeds.

### Python is missing or broken

Install Python 3.10+ and recreate `.venv`, or use the uv command shown in step 1. Do not commit `.venv`.

## Before pushing

Do not push any `.env`, `.venv`, `token.json`, `credentials.json`, or service-role keys. The provided `.env.example` files are the only configuration files teammates need in Git.
