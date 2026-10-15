import os
from typing import Any, Dict, Optional
import math
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



async def store_petition_embedding(
    petition_id: int,
    canonical_text: str,
    embedding: list[float],
) -> Dict[str, Any]:
    """Store a petition's canonical text and BGE embedding."""

    if not canonical_text or not canonical_text.strip():
        raise ValueError("canonical_text cannot be empty.")

    if len(embedding) != 768:
        raise ValueError(
            f"Expected 768 dimensions, got {len(embedding)}."
        )

    if not all(math.isfinite(float(v)) for v in embedding):
        raise ValueError("Embedding contains invalid numeric values.")

    vector_value = "[" + ",".join(
        str(float(v)) for v in embedding
    ) + "]"

    payload = {
        "petition_id": petition_id,
        "embedding": vector_value,
        "canonical_text": canonical_text,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            _api_url("petition_embeddings"),
            json=payload,
            headers=_get_headers(),
        )

        if response.is_error:
            raise RuntimeError(
                "Failed to store petition embedding. "
                f"HTTP {response.status_code}: {response.text[:500]}"
            )

        rows = response.json()

        if not rows:
            raise RuntimeError(
                "Supabase returned no row after embedding insertion."
            )

        return rows[0]


async def search_similar_petitions(
    petition_id: int,
    query_embedding: list[float],
    top_k: int = 5,
) -> list[Dict[str, Any]]:
    """Find similar historical petitions, excluding the current petition."""

    if len(query_embedding) != 768:
        raise ValueError(
            f"Expected 768 dimensions, got {len(query_embedding)}."
        )

    if not all(math.isfinite(float(v)) for v in query_embedding):
        raise ValueError("Embedding contains invalid numeric values.")

    if not 1 <= top_k <= 20:
        raise ValueError("top_k must be between 1 and 20.")

    payload = {
        "query_embedding": "[" + ",".join(
            str(float(v)) for v in query_embedding
        ) + "]",
        "current_petition_id": petition_id,
        "match_count": top_k,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            _api_url("rpc/match_petitions"),
            json=payload,
            headers=_get_headers(),
        )

        if response.is_error:
            raise RuntimeError(
                "Similarity search failed: "
                f"HTTP {response.status_code}: {response.text[:500]}"
            )

        result = response.json()

        if not isinstance(result, list):
            raise RuntimeError("Unexpected similarity-search response.")

        return result


async def get_petition_by_id(
    petition_id: int,
) -> Optional[Dict[str, Any]]:
    """
    Fetch one petition from the petitions table by its ID.
    """
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            _api_url("petitions"),
            params={
                "select": "*",
                "id": f"eq.{petition_id}",
                "limit": "1",
            },
            headers=_get_headers(),
        )
        response.raise_for_status()
        rows = response.json()

    if not rows:
        return None

    return rows[0]


async def get_historical_petitions(
    petition_ids: list[int],
) -> list[Dict[str, Any]]:
    """
    Fetch historical petition details and associated analyses
    for the petition IDs returned by similarity search.
    """
    if not petition_ids:
        return []

    # Preserve order while removing duplicate IDs.
    ordered_ids = list(dict.fromkeys(petition_ids))

    if any(
        isinstance(pid, bool) or not isinstance(pid, int)
        for pid in ordered_ids
    ):
        raise ValueError("All petition IDs must be integers.")

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Fetch the historical petitions.
        petition_response = await client.get(
            _api_url("petitions"),
            params={
                "select": "*",
                "id": f"in.({','.join(map(str, ordered_ids))})",
            },
            headers=_get_headers(),
        )
        petition_response.raise_for_status()
        petitions = petition_response.json()

        # Fetch their AI analysis records.
        analysis_response = await client.get(
            _api_url("analysis"),
            params={
                "select": "*",
                "petition_id": f"in.({','.join(map(str, ordered_ids))})",
            },
            headers=_get_headers(),
        )
        analysis_response.raise_for_status()
        analyses = analysis_response.json()

    petitions_by_id = {
        int(p["id"]): p for p in petitions
    }

    analyses_by_petition_id = {
        int(a["petition_id"]): a for a in analyses
    }

    results = []

    for pid in ordered_ids:
        petition = petitions_by_id.get(pid)

        if petition is None:
            continue

        results.append({
            "petition": petition,
            "analysis": analyses_by_petition_id.get(pid),
        })

    return results



async def insert_analysis(
    petition_id: int,
    summary: str,
    department_code: str,
    priority: str,
    confidence: float,
    reason: str,
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
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(url, json=payload, headers=_get_headers())
        response.raise_for_status()
        data = response.json()
        if not data:
            raise RuntimeError("Supabase returned empty response when inserting analysis.")
        return data[0]["id"]


async def update_petition_status(petition_id: int, status: str) -> None:
    """Updates the status of a petition row."""
    url = f"{_api_url('petitions')}?id=eq.{petition_id}"
    payload = {"status": status}

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.patch(url, json=payload, headers=_get_headers())
        response.raise_for_status()


def _to_petition(row: Dict[str, Any], analyses: Dict[int, Dict[str, Any]]) -> Dict[str, Any]:
    analysis = analyses.get(row["id"])
    return {
        "id": row["id"],
        "subject": row["subject"],
        "body": row["body"],
        "status": row["status"],
        "analysis": ({
            "summary": analysis["summary"],
            "department_code": analysis["department_code"],
            "priority": analysis["priority"],
            "confidence": float(analysis["confidence"]),
            "reason": analysis["reason"],
        } if analysis else None),
    }


async def _fetch_all(table: str, params: Optional[Dict[str, str]] = None) -> list[Dict[str, Any]]:
    headers = _get_headers()
    request_params = {"select": "*", "order": "id.desc", **(params or {})}
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(_api_url(table), params=request_params, headers=headers)
        response.raise_for_status()
        return response.json()


async def list_petitions(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    department: Optional[str] = None,
    search: Optional[str] = None,
) -> list[Dict[str, Any]]:
    """Read only documented petition and analysis columns, then apply cross-table filters."""
    petitions, analysis_rows = await _fetch_all("petitions"), await _fetch_all("analysis")
    analyses = {row["petition_id"]: row for row in analysis_rows}
    rows = [_to_petition(row, analyses) for row in petitions]

    if status:
        rows = [row for row in rows if row["status"].lower() == status.lower()]
    if priority:
        rows = [
            row for row in rows
            if row["analysis"] and row["analysis"]["priority"].lower() == priority.lower()
        ]
    if department:
        rows = [
            row for row in rows
            if row["analysis"] and row["analysis"]["department_code"].lower() == department.lower()
        ]
    if search:
        term = search.lower()
        rows = [
            row for row in rows
            if term in " ".join([
                str(row["id"]), row["subject"], row["body"], row["status"],
                row["analysis"]["department_code"] if row["analysis"] else "",
                row["analysis"]["summary"] if row["analysis"] else "",
            ]).lower()
        ]
    return rows


async def get_petition(petition_id: int) -> Optional[Dict[str, Any]]:
    rows = await list_petitions()
    return next((row for row in rows if row["id"] == petition_id), None)
