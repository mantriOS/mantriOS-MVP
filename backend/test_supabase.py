import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise RuntimeError("Missing Supabase credentials in .env")

url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/authorities_v2"

headers = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
}

try:
    response = httpx.get(
        url,
        headers=headers,
        params={"select": "id,authority_name", "limit": 5},
        timeout=15,
    )

    if response.is_success:
        print("Supabase connection successful!")
        print("Authorities returned:", response.json())
    else:
        print("Request failed:", response.status_code)
        print(response.text)

except httpx.RequestError as error:
    print("Connection error:", error)
