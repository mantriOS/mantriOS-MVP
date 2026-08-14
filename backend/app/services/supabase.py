import os
from typing import Any, Dict, Optional
import asyncio
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")


def _api_url(table: str) -> str:
    if not SUPABASE_URL:
        raise ValueError("SUPABASE_URL must be set in your .env file.")
    return f"{SUPABASE_URL}/rest/v1/{table}"


def _get_headers() -> Dict[str, str]:
    """Build Supabase PostgREST headers using the service role key."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise ValueError(
            "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in your .env file."
        )
    return {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


async def insert_petition(subject: str, body: str, status: str = "pending") -> int:
    """
    Inserts a new row into the `petitions` table.
    Returns the auto-generated petition ID.
    """
    url = _api_url("petitions")
    payload = {"subject": subject, "body": body, "status": status}

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(url, json=payload, headers=_get_headers())
        response.raise_for_status()
        data = response.json()
        if not data:
            raise RuntimeError("Supabase returned empty response when inserting petition.")
        return data[0]["id"]


async def insert_analysis(
    petition_id: int,
    summary: str,
    department_code: str,
    priority: str,
    confidence: float,
    reason: str,
    forwarding_subject: str,
    forwarding_body: str,
) -> int:
    """
    Inserts a new row into the `analysis` table linked to a petition.
    Returns the auto-generated analysis ID.
    """

    url = _api_url("analysis")

    payload = {
        "petition_id": petition_id,
        "summary": summary,
        "department_code": department_code,
        "priority": priority,
        "confidence": confidence,
        "reason": reason,
        "forwarding_subject": forwarding_subject,
        "forwarding_body": forwarding_body,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(
            url,
            json=payload,
            headers=_get_headers(),
        )

        response.raise_for_status()

        data = response.json()

        if not data:
            raise RuntimeError(
                "Supabase returned empty response when inserting analysis."
            )

        return data[0]["id"]

async def get_department_by_code(
    department_code: str,
) -> Optional[Dict[str, Any]]:
    """
    Fetches department details using the department code.

    Returns:
        {
            "department_code": "INF",
            "department_name": "Infrastructure",
            "official_email": "infra.he@kerala.gov.in"
        }

        or None if the department does not exist.
    """
    url = f"{_api_url('departments')}?department_code=eq.{department_code}"

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            url,
            headers=_get_headers(),
        )
        response.raise_for_status()

        data = response.json()

        if not data:
            return None

        return data[0]


async def update_petition_status(petition_id: int, status: str) -> None:
    """Updates the status of a petition row."""
    url = f"{_api_url('petitions')}?id=eq.{petition_id}"
    payload = {"status": status}

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.patch(url, json=payload, headers=_get_headers())
        response.raise_for_status()


def _to_petition(
    row: Dict[str, Any],
    analyses: Dict[int, Dict[str, Any]],
    departments: Dict[str, Dict[str, Any]],
) -> Dict[str, Any]:

    analysis = analyses.get(row["id"])

    if not analysis:
        return {
            "id": row["id"],
            "subject": row["subject"],
            "body": row["body"],
            "status": row["status"],
            "analysis": None,
        }

    department_code = analysis["department_code"]
    department = departments.get(department_code)

    return {
    "id": row["id"],
    "subject": row["subject"],
    "body": row["body"],
    "status": row["status"],

    "analysis": {
        "summary": analysis["summary"],
        "department_code": department_code,
        "priority": analysis["priority"],
        "confidence": float(analysis["confidence"]),
        "reason": analysis["reason"],

        "department": {
            "code": department_code,
            "name": (
                department["department_name"]
                if department
                else None
            ),
            "email": (
                department["official_email"]
                if department
                else None
            ),
        },

        "forwarding": (
            {
                "subject": analysis["forwarding_subject"],
                "body": analysis["forwarding_body"],
            }
            if analysis.get("forwarding_subject")
            and analysis.get("forwarding_body")
            else None
        ),
    },
}


async def _fetch_all(
    table: str,
    params: Optional[Dict[str, str]] = None,
) -> list[Dict[str, Any]]:
    headers = _get_headers()

    request_params = {
        "select": "*",
        **(params or {}),
    }

    # Only tables with an `id` column should be ordered by id.
    if table in {"petitions", "analysis"} and "order" not in request_params:
        request_params["order"] = "id.desc"

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            _api_url(table),
            params=request_params,
            headers=headers,
        )

        response.raise_for_status()

        return response.json()


async def list_petitions(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    department: Optional[str] = None,
    search: Optional[str] = None,
) -> list[Dict[str, Any]]:
    """
    Read petitions, analysis, and department information.
    Applies filters across the related data.
    """

    petitions, analysis_rows, department_rows = await asyncio.gather(
    _fetch_all("petitions"),
    _fetch_all("analysis"),
    _fetch_all(
        "departments",
        {"order": "department_code.asc"},
    ),
)

    analyses = {
        row["petition_id"]: row
        for row in analysis_rows
    }

    departments = {
        row["department_code"]: row
        for row in department_rows
    }

    rows = [
        _to_petition(
            row,
            analyses,
            departments,
        )
        for row in petitions
    ]

    if status:
        rows = [
            row
            for row in rows
            if row["status"].lower() == status.lower()
        ]

    if priority:
        rows = [
            row
            for row in rows
            if (
                row["analysis"]
                and row["analysis"]["priority"].lower()
                == priority.lower()
            )
        ]

    if department:
        rows = [
            row
            for row in rows
            if (
                row["analysis"]
                and row["analysis"]["department_code"].lower()
                == department.lower()
            )
        ]

    if search:
        term = search.lower()

        rows = [
            row
            for row in rows
            if term in " ".join([
                str(row["id"]),
                row["subject"],
                row["body"],
                row["status"],
                (
                    row["analysis"]["department_code"]
                    if row["analysis"]
                    else ""
                ),
                (
                    row["analysis"]["summary"]
                    if row["analysis"]
                    else ""
                ),
            ]).lower()
        ]

    return rows


async def get_petition(petition_id: int) -> Optional[Dict[str, Any]]:
    rows = await list_petitions()
    return next((row for row in rows if row["id"] == petition_id), None)
