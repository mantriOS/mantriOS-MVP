from .client import SUPABASE_SERVICE_KEY, SUPABASE_URL, get_headers
import httpx


async def insert_response(
    petition_id: int,
    message_id: str,
    from_email: str,
    response_text: str,
    parent_message_id: str | None = None,
    cc_emails: list[str] | None = None,
    bcc_emails: list[str] | None = None,
    subject: str | None = None,
):
    """Insert an incoming email response into Supabase."""

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Missing Supabase credentials in .env")

    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/responses_v2"

    response_data = {
        "petition_id": petition_id,
        "message_id": message_id,
        "parent_message_id": parent_message_id,
        "from_email": from_email,
        "cc_emails": cc_emails or [],
        "bcc_emails": bcc_emails or [],
        "subject": subject,
        "response_text": response_text,
    }

    async with httpx.AsyncClient(timeout=15) as client:
        result = await client.post(
            url,
            headers=get_headers(),
            json=response_data,
        )

    result.raise_for_status()

    saved_responses = result.json()

    if not saved_responses:
        raise RuntimeError(
            "Supabase did not return the inserted response."
        )

    return saved_responses[0]


async def get_responses_by_petition_id(petition_id: int):
    """Fetch all email responses associated with a petition."""

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Missing Supabase credentials in .env")

    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/responses_v2"

    async with httpx.AsyncClient(timeout=15) as client:
        result = await client.get(
            url,
            headers=get_headers(),
            params={
                "select": "*",
                "petition_id": f"eq.{petition_id}",
                "order": "received_at.asc",
            },
        )

    result.raise_for_status()

    return result.json()


async def get_response_by_message_id(message_id: str):
    """Fetch an email response using its unique message ID."""

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Missing Supabase credentials in .env")

    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/responses_v2"

    async with httpx.AsyncClient(timeout=15) as client:
        result = await client.get(
            url,
            headers=get_headers(),
            params={
                "select": "*",
                "message_id": f"eq.{message_id}",
                "limit": 1,
            },
        )

    result.raise_for_status()

    responses = result.json()

    if not responses:
        return None

    return responses[0]


async def update_response_summary(
    message_id: str,
    summary: str,
):
    """Save the AI-generated summary of an email response."""

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Missing Supabase credentials in .env")

    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/responses_v2"

    update_data = {
        "summary": summary,
    }

    async with httpx.AsyncClient(timeout=15) as client:
        result = await client.patch(
            url,
            headers=get_headers(),
            params={"message_id": f"eq.{message_id}"},
            json=update_data,
        )

    result.raise_for_status()

    updated_responses = result.json()

    if not updated_responses:
        raise LookupError(
            f"No response found with message ID {message_id}."
        )

    return updated_responses[0]