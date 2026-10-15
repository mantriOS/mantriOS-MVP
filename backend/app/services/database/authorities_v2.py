from .client import SUPABASE_SERVICE_KEY,SUPABASE_URL,get_headers
import os

import httpx


async def get_authorities_by_id(petition_id:int):
    """Fetch authorities from Supabase which matches id."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Missing Supabase credentials in .env")

    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/authorities_v2"

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

async def get_all_authorities_name_and_id():
    """Fetch all the authorities  from Supabase which matches id."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Missing Supabase credentials in .env")

    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/authorities_v2"

    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    }

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(
            url,
            headers=get_headers(),
            params={"select": "authority_name"
                    
                    },
        )

    response.raise_for_status()
    return response.json()

async def insert_authority(authority_name: str, authority_email: str):
    """Insert a new authority into Supabase and return the saved record."""

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Missing Supabase credentials in .env")

    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/authorities_v2"

    authority = {
        "authority_name": authority_name,
        "authority_email": authority_email,
    }

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            url,
            headers=get_headers(),
            json=authority,
        )

    response.raise_for_status()

    saved_authorities = response.json()

    if not saved_authorities:
        raise RuntimeError("Supabase did not return the inserted authority.")

    return saved_authorities[0]

async def update_authority(
    authority_id: int,
    authority_name: str | None = None,
    authority_email: str | None = None,
    active: bool | None = None,
):
    """Update the provided fields of an authority."""

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Missing Supabase credentials in .env")

    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/authorities_v2"

    update_data = {}

    if authority_name is not None:
        update_data["authority_name"] = authority_name

    if authority_email is not None:
        update_data["authority_email"] = authority_email

    if active is not None:
        update_data["active"] = active

    if not update_data:
        raise ValueError("Provide at least one field to update.")

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.patch(
            url,
            headers=get_headers(),
            params={"id": f"eq.{authority_id}"},
            json=update_data,
        )

    response.raise_for_status()

    updated_authorities = response.json()

    if not updated_authorities:
        raise LookupError(
            f"Authority with id {authority_id} was not found."
        )

    return updated_authorities[0]
async def get_authority_by_name(authority_name: str):
    """Fetch an authority from Supabase using its name."""

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise RuntimeError("Missing Supabase credentials in .env")

    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/authorities_v2"

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(
            url,
            headers=get_headers(),
            params={
                "select": "*",
                "authority_name": f"eq.{authority_name}",
                "limit": 1,
            },
        )

    response.raise_for_status()

    authorities = response.json()

    if not authorities:
        return None

    return authorities[0]