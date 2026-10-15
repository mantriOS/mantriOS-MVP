from .client import SUPABASE_SERVICE_KEY, SUPABASE_URL, get_headers
import httpx


async def insert_forwarded_mail_attachment(
    forwarded_mail_id: int,
    file_name: str,
    s3_url: str,
    file_type: str | None = None,
):
    """Save metadata for an attachment included in a forwarded email."""

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Missing Supabase credentials in .env")

    url = (
        f"{SUPABASE_URL.rstrip('/')}"
        "/rest/v1/forwarded_mail_attachments_v2"
    )

    attachment = {
        "forwarded_mail_id": forwarded_mail_id,
        "file_name": file_name,
        "file_type": file_type,
        "s3_url": s3_url,
    }

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            url,
            headers=get_headers(),
            json=attachment,
        )

    response.raise_for_status()

    saved_attachments = response.json()

    if not saved_attachments:
        raise RuntimeError(
            "Supabase did not return the inserted attachment."
        )

    return saved_attachments[0]


async def insert_forwarded_mail(
    petition_id: int,
    to_email: str,
    forwarded_message_id: str,
    subject: str,
    body: str,
    cc_emails: list[str] | None = None,
    bcc_emails: list[str] | None = None,
):
    """Save a successfully forwarded email to Supabase."""

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Missing Supabase credentials in .env")

    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/forwarded_mails_v2"

    forwarded_mail = {
        "petition_id": petition_id,
        "to_email": to_email,
        "forwarded_message_id": forwarded_message_id,
        "subject": subject,
        "body": body,
        "cc_emails": cc_emails or [],
        "bcc_emails": bcc_emails or [],
    }

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            url,
            headers=get_headers(),
            json=forwarded_mail,
        )

    response.raise_for_status()

    saved_mail = response.json()

    if not saved_mail:
        raise RuntimeError(
            "Supabase did not return the forwarded mail record."
        )

    return saved_mail[0]


async def get_forwarded_mail_by_petition_id(petition_id: int):
    """Fetch all forwarding records for a specific petition."""

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Missing Supabase credentials in .env")

    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/forwarded_mails_v2"

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(
            url,
            headers=get_headers(),
            params={
                "select": "*",
                "petition_id": f"eq.{petition_id}",
                "order": "forwarded_at.desc",
            },
        )

    response.raise_for_status()

    return response.json()


async def get_forwarded_mail_by_message_id(
    forwarded_message_id: str,
):
    """Fetch a forwarded email using its message ID."""

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Missing Supabase credentials in .env")

    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/forwarded_mails_v2"

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(
            url,
            headers=get_headers(),
            params={
                "select": "*",
                "forwarded_message_id": f"eq.{forwarded_message_id}",
                "limit": 1,
            },
        )

    response.raise_for_status()

    forwarded_mails = response.json()

    if not forwarded_mails:
        return None

    return forwarded_mails[0]