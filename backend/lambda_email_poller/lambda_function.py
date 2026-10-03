import imaplib
import email
from email.header import decode_header
import json
import logging
import os
import re
import urllib.request
import urllib.error
import base64

# Setup logger
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Configuration from Environment Variables
IMAP_SERVER = os.environ.get("IMAP_SERVER", "imap.gmail.com")
IMAP_PORT = int(os.environ.get("IMAP_PORT", "993"))
IMAP_USER = os.environ.get("IMAP_USER", "")
IMAP_PASSWORD = os.environ.get("IMAP_PASSWORD", "")
IMAP_FOLDER = os.environ.get("IMAP_FOLDER", "INBOX")
API_ENDPOINT = os.environ.get("API_ENDPOINT", "")
API_AUTH_TOKEN = os.environ.get("API_AUTH_TOKEN", "")  # Optional Bearer or Custom Token


def decode_str(header_value: str) -> str:
    """Safely decode email header strings that might be encoded in MIME format (RFC 2047)."""
    if not header_value:
        return ""
    decoded_fragments = decode_header(header_value)
    result = []
    for fragment, charset in decoded_fragments:
        if isinstance(fragment, bytes):
            try:
                charset = charset or "utf-8"
                result.append(fragment.decode(charset, errors="replace"))
            except Exception:
                result.append(fragment.decode("utf-8", errors="replace"))
        else:
            result.append(str(fragment))
    return "".join(result)


def extract_body(msg: email.message.Message) -> str:
    """
    Extract readable text body from email message.
    Prefers text/plain; falls back to stripped text/html if plain text is absent.
    """
    plain_text = ""
    html_text = ""

    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition", ""))

            # Skip attachments here, they are processed separately
            if "attachment" in content_disposition or part.get_filename():
                continue

            charset = part.get_content_charset() or "utf-8"
            payload = part.get_payload(decode=True)
            if not payload:
                continue

            try:
                text = payload.decode(charset, errors="replace")
            except Exception:
                text = payload.decode("utf-8", errors="replace")

            if content_type == "text/plain" and not plain_text:
                plain_text = text
            elif content_type == "text/html" and not html_text:
                html_text = text
    else:
        content_type = msg.get_content_type()
        charset = msg.get_content_charset() or "utf-8"
        payload = msg.get_payload(decode=True)
        if payload:
            try:
                text = payload.decode(charset, errors="replace")
            except Exception:
                text = payload.decode("utf-8", errors="replace")

            if content_type == "text/plain":
                plain_text = text
            elif content_type == "text/html":
                html_text = text

    if plain_text.strip():
        return plain_text.strip()

    # Clean HTML tags if text/plain was not found
    if html_text:
        cleaned = re.sub(r"<style.*?</style>", "", html_text, flags=re.DOTALL)
        cleaned = re.sub(r"<script.*?</script>", "", cleaned, flags=re.DOTALL)
        cleaned = re.sub(r"<[^>]+>", " ", cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned)
        return cleaned.strip()

    return ""


def call_process_email(payload: dict) -> dict:
    """Send HTTP POST request to FastAPI /process-email endpoint."""
    if not API_ENDPOINT:
        raise ValueError("API_ENDPOINT environment variable is not configured.")

    req_data = json.dumps(payload).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "MantriOS-EmailPoller/1.0",
    }
    if API_AUTH_TOKEN:
        headers["Authorization"] = f"Bearer {API_AUTH_TOKEN}"

    req = urllib.request.Request(API_ENDPOINT, data=req_data, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=45) as resp:
        resp_body = resp.read().decode("utf-8")
        return json.loads(resp_body) if resp_body else {}


def lambda_handler(event, context):
    """
    AWS Lambda handler triggered every minute by Amazon EventBridge.
    Polls the configured IMAP mailbox for UNSEEN emails, extracts details,
    and calls FastAPI `/api/v1/zapier/process-email`.
    """
    if not IMAP_USER or not IMAP_PASSWORD:
        logger.error("IMAP_USER and IMAP_PASSWORD must be configured in environment variables.")
        return {"statusCode": 500, "error": "Missing IMAP credentials"}

    if not API_ENDPOINT:
        logger.error("API_ENDPOINT must be configured in environment variables.")
        return {"statusCode": 500, "error": "Missing API_ENDPOINT"}

    mail = None
    processed_count = 0
    errors = []

    try:
        # 1. Connect to IMAP server over SSL
        mail = imaplib.IMAP4_SSL(IMAP_SERVER, IMAP_PORT)
        mail.login(IMAP_USER, IMAP_PASSWORD)
        mail.select(IMAP_FOLDER)

        # 2. Search for UNSEEN (unread) emails
        status, response = mail.search(None, "UNSEEN")
        if status != "OK":
            logger.error("Failed to search mailbox: %s", response)
            return {"statusCode": 500, "error": f"Search failed: {response}"}

        msg_ids = response[0].split()
        total_unseen = len(msg_ids)
        logger.info("Found %d unseen email(s) in %s", total_unseen, IMAP_FOLDER)

        # 3. Process each unread email
        for msg_id in msg_ids:
            msg_id_str = msg_id.decode("utf-8")
            status, msg_data = mail.fetch(msg_id, "(RFC822)")
            if status != "OK" or not msg_data:
                logger.error("Failed to fetch message ID %s", msg_id_str)
                continue

            # Parse email RFC 822 format
            raw_email = msg_data[0][1]
            msg = email.message_from_bytes(raw_email)

            subject = decode_str(msg.get("Subject", "(No Subject)"))
            sender = decode_str(msg.get("From", ""))
            to_addr = decode_str(msg.get("To", ""))
            date = decode_str(msg.get("Date", ""))
            message_id_header = decode_str(msg.get("Message-ID", ""))
            body = extract_body(msg)

            logger.info("Processing email ID %s: Subject=%r, From=%r", msg_id_str, subject, sender)

            attachments_list = []
            if msg.is_multipart():
                for part in msg.walk():
                    filename = part.get_filename()
                    if filename:
                        filename = decode_str(filename)
                        content_type = part.get_content_type()
                        payload_bytes = part.get_payload(decode=True)
                        if payload_bytes:
                            # Base64 encode the attachment
                            b64_data = base64.b64encode(payload_bytes).decode("utf-8")
                            attachments_list.append({
                                "filename": filename,
                                "content_type": content_type,
                                "size_bytes": len(payload_bytes),
                                "data_base64": b64_data
                            })
                            logger.info("Extracted attachment: %s (%d bytes)", filename, len(payload_bytes))

            api_payload = {
                "attachments": attachments_list,
                "subject": subject,
                "body": body,
                "headers": {
                    "from": sender,
                    "to": to_addr,
                    "date": date,
                    "message_id": message_id_header,
                    "folder": IMAP_FOLDER,
                },
            }

            try:
                # 4. Call FastAPI /process-email endpoint
                result = call_process_email(api_payload)
                logger.info(
                    "Successfully processed email %s. Response petition_id=%s",
                    msg_id_str,
                    result.get("petition_id"),
                )

                # 5. Mark as Seen (Read) ONLY upon successful API response
                mail.store(msg_id, "+FLAGS", "\\Seen")
                processed_count += 1

            except Exception as e:
                logger.error("Error calling /process-email for email %s: %s", msg_id_str, e)
                errors.append({"msg_id": msg_id_str, "error": str(e)})
                # Leave email UNSEEN so it is not lost and can be retried on next execution

        return {
            "statusCode": 200,
            "processed": processed_count,
            "total_unseen": total_unseen,
            "errors": errors,
        }

    except Exception as e:
        logger.error("Fatal error during email polling: %s", e)
        return {"statusCode": 500, "error": str(e)}

    finally:
        if mail:
            try:
                mail.close()
            except Exception:
                pass
            try:
                mail.logout()
            except Exception:
                pass
