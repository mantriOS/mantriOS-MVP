import asyncio
import json
import logging
import os
import re
from pathlib import Path
from typing import Any, Dict

import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv
import httpx

load_dotenv()

logger = logging.getLogger(__name__)

# Path to system prompt file
PROMPT_FILE_PATH = Path(__file__).parent.parent / "prompts" / "petition_analysis.txt"
DEFAULT_BEDROCK_MODEL_ID = "google.gemma-3-27b-it"


def load_system_prompt() -> str:
    """Loads the system prompt from prompts/petition_analysis.txt."""
    if not PROMPT_FILE_PATH.exists():
        raise FileNotFoundError(f"Prompt file not found at {PROMPT_FILE_PATH}")
    return PROMPT_FILE_PATH.read_text(encoding="utf-8").strip()


def get_bedrock_client():
    """Initializes the AWS Bedrock Runtime client via boto3."""
    region = os.getenv("AWS_REGION", "ap-south-1")
    access_key = os.getenv("AWS_ACCESS_KEY_ID")
    secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    profile = os.getenv("AWS_PROFILE")

    if access_key and secret_key:
        return boto3.client(
            "bedrock-runtime",
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region,
        )
    elif profile:
        session = boto3.Session(profile_name=profile, region_name=region)
        return session.client("bedrock-runtime", region_name=region)

    return boto3.client("bedrock-runtime", region_name=region)


def _clean_json_text(text: str) -> str:
    """Cleans code fences and isolates valid JSON object substring."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        text = match.group(0)
    return text.strip()


async def _invoke_bedrock_with_api_key(api_key: str, model_id: str, content_blocks: list, region: str) -> str:
    """
    Invokes Bedrock via HTTP using an API Key (Bearer token).
    Supports both Bedrock Mantle and standard Bedrock runtime endpoints.
    """
    import base64
    import copy
    
    # Convert bytes to base64 strings for HTTP JSON serialization
    http_blocks = copy.deepcopy(content_blocks)
    for block in http_blocks:
        if "document" in block and "source" in block["document"] and "bytes" in block["document"]["source"]:
            if isinstance(block["document"]["source"]["bytes"], bytes):
                block["document"]["source"]["bytes"] = base64.b64encode(block["document"]["source"]["bytes"]).decode('utf-8')
        elif "image" in block and "source" in block["image"] and "bytes" in block["image"]["source"]:
            if isinstance(block["image"]["source"]["bytes"], bytes):
                block["image"]["source"]["bytes"] = base64.b64encode(block["image"]["source"]["bytes"]).decode('utf-8')
                
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        # Option A: Bedrock Mantle (OpenAI-compatible) endpoint
        mantle_url = f"https://bedrock-mantle.{region}.api.aws/v1/chat/completions"
        # Convert AWS Converse blocks to OpenAI blocks for Mantle
        openai_blocks = []
        for b in http_blocks:
            if "text" in b:
                openai_blocks.append({"type": "text", "text": b["text"]})
            elif "image" in b:
                fmt = b["image"].get("format", "jpeg")
                b64 = b["image"]["source"]["bytes"]
                openai_blocks.append({"type": "image_url", "image_url": {"url": f"data:image/{fmt};base64,{b64}"}})
            elif "document" in b:
                # OpenAI vision doesn't natively support PDF document blocks in standard chat format.
                # We will just append a warning or try to pass it if the proxy supports it.
                logger.warning("Bedrock Mantle (OpenAI format) does not natively support PDF/document blocks.")
                
        # If no attachments or just text, we can just pass the string to be safe for basic OpenAI compatibility
        if len(openai_blocks) == 1 and openai_blocks[0]["type"] == "text":
            final_content = openai_blocks[0]["text"]
        else:
            final_content = openai_blocks

        mantle_payload = {
            "model": model_id,
            "messages": [{"role": "user", "content": final_content}],
            "temperature": 0.2,
            "max_tokens": 1024,
        }
        try:
            res = await client.post(mantle_url, headers=headers, json=mantle_payload)
            if res.status_code == 200:
                data = res.json()
                return data["choices"][0]["message"]["content"]
            else:
                logger.error(f"Bedrock Mantle failed: HTTP {res.status_code} - {res.text}")
        except Exception as e:
            logger.debug("Bedrock Mantle attempt failed (%s), falling back to standard runtime endpoint", e)

        # Option B: Standard Bedrock runtime converse endpoint with Bearer token
        converse_url = f"https://bedrock-runtime.{region}.amazonaws.com/model/{model_id}/converse"
        converse_payload = {
            "messages": [{"role": "user", "content": http_blocks}],
            "inferenceConfig": {"temperature": 0.2, "maxTokens": 1024},
        }

        res = await client.post(converse_url, headers=headers, json=converse_payload)
        if res.status_code != 200:
            # Option C: InvokeModel endpoint with Bearer token
            invoke_url = f"https://bedrock-runtime.{region}.amazonaws.com/model/{model_id}/invoke"
            invoke_payload = {
                "messages": [{"role": "user", "content": http_blocks}],
                "max_tokens": 1024,
                "temperature": 0.2,
            }
            res2 = await client.post(invoke_url, headers=headers, json=invoke_payload)
            if res2.status_code != 200:
                raise RuntimeError(
                    f"Bedrock API Key call failed with HTTP {res.status_code}: {res.text}. "
                    f"Invoke fallback also failed with HTTP {res2.status_code}: {res2.text}"
                )
            body = res2.json()
            if "choices" in body and len(body["choices"]) > 0:
                return body["choices"][0]["message"]["content"]
            if "generation" in body:
                return body["generation"]
            return json.dumps(body)

        data = res.json()
        return data["output"]["message"]["content"][0]["text"]


def _invoke_bedrock_sync(model_id: str, content_blocks: list) -> str:
    """
    Synchronous call to AWS Bedrock using boto3 SigV4 credentials.
    """
    client = get_bedrock_client()

    try:
        response = client.converse(
            modelId=model_id,
            messages=[
                {
                    "role": "user",
                    "content": content_blocks,
                }
            ],
            inferenceConfig={
                "temperature": 0.2,
                "maxTokens": 1024,
            },
        )
        return response["output"]["message"]["content"][0]["text"]
    except ClientError as e:
        error_code = e.response.get("Error", {}).get("Code", "")
        error_msg = e.response.get("Error", {}).get("Message", "")
        logger.warning(
            "Converse API call failed with %s: %s. Attempting InvokeModel fallback...",
            error_code,
            error_msg,
        )

        if "Operation not allowed" in error_msg:
            raise RuntimeError(
                f"AWS Bedrock Quota / Access Error: Access to '{model_id}' is restricted or has a 0.0 quota. "
                "Use a Bedrock API Key via BEDROCK_API_KEY in backend/.env, or request a service quota increase in Region ap-south-1."
            ) from e

    # Fallback to InvokeModel
    body_payload = json.dumps(
        {
            "messages": [
                {"role": "user", "content": content_blocks}
            ],
            "max_tokens": 1024,
            "temperature": 0.2,
        }
    )

    try:
        response = client.invoke_model(
            modelId=model_id,
            body=body_payload,
            contentType="application/json",
            accept="application/json",
        )
        response_body = json.loads(response["body"].read().decode("utf-8"))
        if "choices" in response_body and len(response_body["choices"]) > 0:
            return response_body["choices"][0]["message"]["content"]
        if "generation" in response_body:
            return response_body["generation"]
        if "output" in response_body:
            return response_body["output"]
        return json.dumps(response_body)
    except ClientError as e:
        error_msg = e.response.get("Error", {}).get("Message", "")
        if "Operation not allowed" in error_msg:
            raise RuntimeError(
                f"AWS Bedrock Quota / Access Error: Access to '{model_id}' is restricted or has a 0.0 quota. "
                "Use a Bedrock API Key via BEDROCK_API_KEY in backend/.env, or request a service quota increase in Region ap-south-1."
            ) from e
        raise


from app.schemas.email_webhook import EmailAttachment
from typing import List

async def analyze_email(subject: str, body: str, headers: Dict[str, Any], attachments: List[EmailAttachment] = None) -> Dict[str, Any]:
    """
    Analyzes citizen petitions using AWS Bedrock Gemma 3 27B.
    Supports either direct Bedrock API Key (Bearer token) or AWS IAM credentials.
    """
    model_id = os.getenv("BEDROCK_MODEL_ID", DEFAULT_BEDROCK_MODEL_ID)
    region = os.getenv("AWS_REGION", "ap-south-1")
    api_key = os.getenv("BEDROCK_API_KEY")
    system_prompt = load_system_prompt()

    email_content = f"""
Subject:
{subject}

Headers:
{json.dumps(headers, indent=2)}

Body:
{body}
"""
    full_prompt = f"{system_prompt}\n\nAnalyze this petition:\n{email_content}"
    if attachments:
        full_prompt += "\n\n[Note: The user has attached files. Please consider the attached documents/images as part of this petition.]"

    # Convert attachments to Converse API blocks
    content_blocks = [{"text": full_prompt}]
    if attachments:
        import base64
        for att in attachments:
            try:
                # Bedrock converse natively supports pdf, csv, doc, docx, xls, xlsx, html, txt, md
                raw_bytes = base64.b64decode(att.data_base64) if att.data_base64 else b""
                if not raw_bytes: continue
                
                # Basic size check (Bedrock limit is 4.5MB per doc/image)
                if len(raw_bytes) > 4.5 * 1024 * 1024:
                    logger.warning(f"Attachment {att.filename} exceeds Bedrock size limit (4.5MB). Skipping native block.")
                    continue
                    
                ext = att.filename.split('.')[-1].lower() if '.' in att.filename else ''
                clean_name = re.sub(r'[^a-zA-Z0-9]', '', att.filename.split('.')[0])[:20] or "attachment"
                
                if ext in ['pdf', 'csv', 'doc', 'docx', 'xls', 'xlsx', 'html', 'txt', 'md']:
                    content_blocks.append({
                        "document": {
                            "format": ext,
                            "name": clean_name,
                            "source": {"bytes": raw_bytes}
                        }
                    })
                elif ext in ['png', 'jpeg', 'jpg', 'gif', 'webp']:
                    format_img = "jpeg" if ext == "jpg" else ext
                    content_blocks.append({
                        "image": {
                            "format": format_img,
                            "source": {"bytes": raw_bytes}
                        }
                    })
            except Exception as e:
                logger.error(f"Failed to process attachment {att.filename} for Bedrock: {e}")

    if api_key and api_key.strip():
        # Path 1: Direct HTTP Bearer token via Bedrock API Key
        raw_response = await _invoke_bedrock_with_api_key(api_key.strip(), model_id, content_blocks, region)
    else:
        # Path 2: AWS IAM / SigV4 via Boto3
        raw_response = await asyncio.to_thread(_invoke_bedrock_sync, model_id, content_blocks)

    cleaned_text = _clean_json_text(raw_response)
    try:
        result = json.loads(cleaned_text)
    except json.JSONDecodeError as err:
        logger.error("Failed to parse JSON from Bedrock response: %r", raw_response)
        raise ValueError(f"Model output was not valid JSON: {raw_response}") from err

    required_keys = ["summary", "department_code", "priority", "confidence", "reason"]
    for key in required_keys:
        if key not in result:
            raise ValueError(f"Missing required key '{key}' in Bedrock model response: {result}")

    return result
