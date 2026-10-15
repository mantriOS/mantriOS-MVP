import os
from typing import Any, Dict, Optional
import math

from pathlib import Path
import httpx
from dotenv import load_dotenv

backend_dir = Path(__file__).resolve().parent.parent.parent
env_file = backend_dir / ".env"
load_dotenv(dotenv_path=env_file)
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


async def search_similar_petitions(
    embedding: list[float],
    top_k: int = 3,
    similarity_threshold: float = 0.35,
) -> list[Dict[str, Any]]:
    """
    Finds top-k semantically similar historical petitions using Supabase RPC `match_petitions`.
    Returns empty list gracefully if RPC or table is not yet migrated.
    """
    url = f"{SUPABASE_URL}/rest/v1/rpc/match_petitions"
    payload = {
        "query_embedding": embedding,
        "match_count": top_k,
        "similarity_threshold": similarity_threshold,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload, headers=_get_headers())
            if response.status_code == 200:
                return response.json()
            return []
    except Exception:
        return []


async def upsert_petition_embedding(
    petition_id: int,
    content_hash: str,
    embedding: list[float],
    department_code: str,
    priority: str,
    summary: str,
) -> bool:
    """
    Stores or updates a petition embedding vector for future RAG few-shot retrieval.
    Gracefully handles cases where the table doesn't exist yet.
    """
    url = _api_url("petition_embeddings")
    payload = {
        "petition_id": petition_id,
        "content_hash": content_hash,
        "embedding": embedding,
        "department_code": department_code,
        "priority": priority,
        "summary": summary,
    }

    headers = {
        **_get_headers(),
        "Prefer": "resolution=merge-duplicates",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            return response.status_code in (200, 201)
    except Exception:
        return False


# ── Global Email Branding (Header & Footer) ───────────────────────────────────

async def get_email_branding() -> Dict[str, Any]:
    """Retrieves the global email branding configuration (header and footer)."""
    url = f"{_api_url('email_branding')}?id=eq.global_default"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=_get_headers())
            if response.status_code == 200:
                data = response.json()
                if data:
                    return data[0]
    except Exception:
        pass
    return {
        "id": "global_default",
        "header_url": None,
        "header_filename": None,
        "footer_url": None,
        "footer_filename": None,
    }


async def update_email_branding(
    header_url: Optional[str] = None,
    header_filename: Optional[str] = None,
    footer_url: Optional[str] = None,
    footer_filename: Optional[str] = None,
    updated_by: str = "admin",
) -> Dict[str, Any]:
    """Updates global email branding header or footer."""
    payload: Dict[str, Any] = {
        "id": "global_default",
        "updated_at": "now()",
        "updated_by": updated_by,
    }
    if header_url is not None:
        payload["header_url"] = header_url
    if header_filename is not None:
        payload["header_filename"] = header_filename
    if footer_url is not None:
        payload["footer_url"] = footer_url
    if footer_filename is not None:
        payload["footer_filename"] = footer_filename

    headers = {
        **_get_headers(),
        "Prefer": "resolution=merge-duplicates,return=representation",
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(_api_url("email_branding"), json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data[0] if data else payload




# ── Shared Signatures Library ─────────────────────────────────────────────────

async def list_signatures() -> list[Dict[str, Any]]:
    """Lists all shared email signatures ordered by most recent."""
    try:
        return await _fetch_all("email_signatures", params={"order": "created_at.desc"})
    except Exception:
        return []


async def get_signature(sig_id: int) -> Optional[Dict[str, Any]]:
    url = f"{_api_url('email_signatures')}?id=eq.{sig_id}"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=_get_headers())
            if response.status_code == 200:
                data = response.json()
                return data[0] if data else None
    except Exception:
        pass
    return None


async def create_signature(name: str, image_url: str, filename: str, created_by: str = "officer") -> Dict[str, Any]:
    """Creates a new shared signature."""
    payload = {
        "name": name,
        "image_url": image_url,
        "filename": filename,
        "created_by": created_by,
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(_api_url("email_signatures"), json=payload, headers=_get_headers())
        response.raise_for_status()
        data = response.json()
        return data[0]


async def update_signature(sig_id: int, name: Optional[str] = None, image_url: Optional[str] = None, filename: Optional[str] = None) -> Dict[str, Any]:
    """Updates an existing shared signature image or name."""
    url = f"{_api_url('email_signatures')}?id=eq.{sig_id}"
    payload: Dict[str, Any] = {"updated_at": "now()"}
    if name is not None:
        payload["name"] = name
    if image_url is not None:
        payload["image_url"] = image_url
    if filename is not None:
        payload["filename"] = filename

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.patch(url, json=payload, headers=_get_headers())
        response.raise_for_status()
        data = response.json()
        return data[0] if data else payload


async def delete_signature(sig_id: int) -> bool:
    """Deletes a shared signature."""
    url = f"{_api_url('email_signatures')}?id=eq.{sig_id}"
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.delete(url, headers=_get_headers())
        return response.status_code in (200, 204)


