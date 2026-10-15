from .client import SUPABASE_SERVICE_KEY,SUPABASE_URL,get_headers
import os
import httpx
async def get_petitions():
    """Fetch all petitions from Supabase."""

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Missing Supabase credentials in .env")

    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/petitions_v2"

    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    }

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(
            url,
            headers=get_headers(),
            params={"select": "*"},
        )

    response.raise_for_status()

    return response.json()

async def insert_petition(
    from_email,
    original_text,
    subject=None,
    message_id=None,
    cc_emails=None,
):
    """Insert a petition into Supabase and return the saved row."""

    url = f"{SUPABASE_URL}.rstrip('/')/rest/v1/petitions_v2"

    petition = {
        "from_email": from_email,
        "original_text": original_text,
        "subject": subject,
        "message_id": message_id,
    }

    if cc_emails is not None:
        petition["cc_emails"] = cc_emails

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            url,
            headers=get_headers(),
            json=petition,
        )

    response.raise_for_status()

    saved_petitions = response.json()

    if not saved_petitions:
        raise RuntimeError("Supabase did not return the inserted petition.")

    return saved_petitions[0]

async def get_petitions_by_id(petition_id:int):
    """Fetch petitions from Supabase which matches id."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Missing Supabase credentials in .env")

    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/petitions_v2"

    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    }

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(
            url,
            headers=get_headers(),
            params={"select": "*"
                    ,"id": f"eq.{petition_id}","limit": 1},
        )

    response.raise_for_status()

    return response.json()

async def update_petition_status(petition_id: int, status: str):
    """Update a petition's status and return the updated row."""

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Missing Supabase credentials in .env")

    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/petitions_v2"

    update_data = {
        "status": status
    }

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.patch(
            url,
            headers=get_headers(),
            params={"id": f"eq.{petition_id}"},
            json=update_data,
        )

    response.raise_for_status()

    updated_petitions = response.json()

    if not updated_petitions:
        raise LookupError(f"Petition with id {petition_id} was not found.")

    return updated_petitions[0]