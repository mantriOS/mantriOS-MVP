from .client import SUPABASE_SERVICE_KEY, SUPABASE_URL, get_headers
import httpx


TABLE_URL = f"{SUPABASE_URL.rstrip('/')}/rest/v1/petition_attachments_v2"


async def insert_petition_attachment(
    petition_id: int,
    file_name: str,
    s3_url: str,
    file_type: str | None = None,
):
    """Insert attachment metadata for a petition."""

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Missing Supabase credentials in .env")

    attachment = {
        "petition_id": petition_id,
        "file_name": file_name,
        "file_type": file_type,
        "s3_url": s3_url,
    }

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            TABLE_URL,
            headers=get_headers(),
            json=attachment,
        )

    response.raise_for_status()

    saved_attachment = response.json()

    if not saved_attachment:
        raise RuntimeError("Supabase did not return the inserted attachment.")

    return saved_attachment[0]


async def get_petition_attachments(petition_id: int):
    """Retrieve all attachments belonging to a petition."""

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Missing Supabase credentials in .env")

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(
            TABLE_URL,
            headers=get_headers(),
            params={
                "select": "*",
                "petition_id": f"eq.{petition_id}",
                "order": "id.asc",
            },
        )

    response.raise_for_status()
    return response.json()


async def get_petition_attachment_by_id(attachment_id: int):
    """Retrieve a specific petition attachment by its ID."""

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Missing Supabase credentials in .env")

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(
            TABLE_URL,
            headers=get_headers(),
            params={
                "select": "*",
                "id": f"eq.{attachment_id}",
                "limit": 1,
            },
        )

    response.raise_for_status()

    attachments = response.json()

    if not attachments:
        return None

    return attachments[0]