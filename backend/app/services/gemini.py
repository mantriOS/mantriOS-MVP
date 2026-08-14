import asyncio
import json
import os
from pathlib import Path
from typing import Any, Dict
import httpx
from dotenv import load_dotenv

load_dotenv()

# Path to system prompt file
PROMPT_FILE_PATH = Path(__file__).parent.parent / "prompts" / "petition_analysis.txt"


def load_system_prompt() -> str:
    """Loads the system prompt from prompts/petition_analysis.txt."""
    if not PROMPT_FILE_PATH.exists():
        raise FileNotFoundError(f"Prompt file not found at {PROMPT_FILE_PATH}")
    return PROMPT_FILE_PATH.read_text(encoding="utf-8").strip()


async def analyze_email(subject: str, body: str, headers: Dict[str, Any]) -> Dict[str, Any]:
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set.")

    system_prompt = load_system_prompt()

    email_content = f"""
Subject:
{subject}

Headers:
{json.dumps(headers, indent=2)}

Body:
{body}
"""

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": f"{system_prompt}\n\n{email_content}"
                    }
                ]
            }
        ]
    }

    # List of candidate models to try in case of rate limits or model unavailability
    candidate_models = ["gemini-3.5-flash"]

    async with httpx.AsyncClient(timeout=60.0) as client:
        last_exception = None

        for model_name in candidate_models:
            url = (
                "https://generativelanguage.googleapis.com/v1beta/models/"
                f"{model_name}:generateContent?key={gemini_api_key}"
            )
            delay = 2.0

            for attempt in range(3):
                try:
                    response = await client.post(url, json=payload)
                    
                    if response.status_code == 429:
                        print(f"Model {model_name} rate limited (429). Retrying or switching model...")
                        await asyncio.sleep(delay)
                        delay *= 2.0
                        continue

                    response.raise_for_status()

                    data = response.json()
                    candidates = data.get("candidates", [])
                    if not candidates:
                        raise ValueError("No candidate responses returned from Gemini API.")

                    text = candidates[0]["content"]["parts"][0]["text"].strip()

                    # Clean markdown backticks if Gemini includes them
                    if text.startswith("```"):
                        lines = text.splitlines()
                        if lines[0].startswith("```"):
                            lines = lines[1:]
                        if lines and lines[-1].strip() == "```":
                            lines = lines[:-1]
                        text = "\n".join(lines).strip()

                    result = json.loads(text)

                    required = [
                        "summary",
                        "department_code",
                        "priority",
                        "confidence",
                        "reason",
                        "forwarding_subject",
                        "forwarding_body",
                    ]

                    for key in required:
                        if key not in result:
                            raise ValueError(f"Missing key in AI response: {key}")

                    return result

                except Exception as e:
                    print(f"Attempt {attempt + 1} with model {model_name} failed: {e}")
                    last_exception = e
                    await asyncio.sleep(delay)
                    delay *= 2.0

        if last_exception:
            raise last_exception
        raise RuntimeError("All Gemini models failed to respond.")

