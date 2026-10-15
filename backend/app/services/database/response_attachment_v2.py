from .client import SUPABASE_SERVICE_KEY, SUPABASE_URL, get_headers
import httpx


async def insert_response_attachment(
    response_id: int,
    file_name: str,
    s3_url: str,
    file_type: str | None = None,
):
    """Save metadata for an attachment belonging to an email response."""

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Missing Supabase credentials in .env")

    url = (
        f"{SUPABASE_URL.rstrip('/')}"
        "/rest/v1/response_attachments_v2"
    )

    attachment = {
        "response_id": response_id,
        "file_name": file_name,
        "file_type": file_type,
        "s3_url": s3_url,
    }

    async with httpx.AsyncClient(timeout=15) as client:
        result = await client.post(
            url,
            headers=get_headers(),
            json=attachment,
        )

    result.raise_for_status()

    saved_attachments = result.json()

    if not saved_attachments:
        raise RuntimeError(
            "Supabase did not return the inserted attachment."
        )

    return saved_attachments[0]


async def get_response_attachments(response_id: int):
    """Fetch all attachments associated with an email response."""

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Missing Supabase credentials in .env")

    url = (
        f"{SUPABASE_URL.rstrip('/')}"
        "/rest/v1/response_attachments_v2"
    )

    async with httpx.AsyncClient(timeout=15) as client:
        result = await client.get(
            url,
            headers=get_headers(),
            params={
                "select": "*",
                "response_id": f"eq.{response_id}",
            },
        )

    result.raise_for_status()

    return result.json()


async def get_response_attachment_by_id(attachment_id: int):
    """Fetch one response attachment using its database ID."""

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Missing Supabase credentials in .env")

    url = (
        f"{SUPABASE_URL.rstrip('/')}"
        "/rest/v1/response_attachments_v2"
    )

    async with httpx.AsyncClient(timeout=15) as client:
        result = await client.get(
            url,
            headers=get_headers(),
            params={
                "select": "*",
                "id": f"eq.{attachment_id}",
                "limit": 1,
            },
        )

    result.raise_for_status()

    attachments = result.json()

    if not attachments:
        return None

    return attachments[0]