from .client import SUPABASE_SERVICE_KEY, SUPABASE_URL, get_headers
import httpx


async def insert_human_review(
    petition_id: int,
    approved_authority_id: int,
    approved_priority: str,
    officer_notes: str | None = None,
):
    """Insert the officer's review into Supabase."""

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Missing Supabase credentials in .env")

    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/human_review_v2"

    review = {
        "petition_id": petition_id,
        "approved_authority_id": approved_authority_id,
        "approved_priority": approved_priority,
        "officer_notes": officer_notes,
    }

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            url,
            headers=get_headers(),
            json=review,
        )

    response.raise_for_status()

    saved_review = response.json()

    if not saved_review:
        raise RuntimeError(
            "Supabase did not return the inserted review."
        )

    return saved_review[0]


async def get_human_review_by_petition_id(petition_id: int):
    """Fetch the human review for a specific petition."""

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Missing Supabase credentials in .env")

    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/human_review_v2"

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(
            url,
            headers=get_headers(),
            params={
                "select": "*",
                "petition_id": f"eq.{petition_id}",
                "limit": 1,
            },
        )

    response.raise_for_status()

    reviews = response.json()

    if not reviews:
        return None

    return reviews[0]


async def update_human_review(
    petition_id: int,
    approved_authority_id: int | None = None,
    approved_priority: str | None = None,
    officer_notes: str | None = None,
):
    """Update the officer's review for an existing petition."""

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Missing Supabase credentials in .env")

    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/human_review_v2"

    update_data = {}

    if approved_authority_id is not None:
        update_data["approved_authority_id"] = approved_authority_id

    if approved_priority is not None:
        update_data["approved_priority"] = approved_priority

    if officer_notes is not None:
        update_data["officer_notes"] = officer_notes

    if not update_data:
        raise ValueError("Provide at least one field to update.")

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.patch(
            url,
            headers=get_headers(),
            params={"petition_id": f"eq.{petition_id}"},
            json=update_data,
        )

    response.raise_for_status()

    updated_reviews = response.json()

    if not updated_reviews:
        raise LookupError(
            f"No human review found for petition ID {petition_id}."
        )

    return updated_reviews[0]