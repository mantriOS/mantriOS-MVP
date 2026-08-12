import base64

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

TOKEN_PATH = BASE_DIR / "token.json"

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]


def get_gmail_service():
    creds = Credentials.from_authorized_user_file(
        str(TOKEN_PATH),
        SCOPES
    )

    service = build("gmail", "v1", credentials=creds)
    return service


def get_latest_emails(max_results=5):
    service = get_gmail_service()

    results = service.users().messages().list(
        userId="me",
        maxResults=max_results
    ).execute()

    messages = results.get("messages", [])

    if not messages:
        print("No emails found.")
        return

    for message in messages:

        msg = service.users().messages().get(
            userId="me",
            id=message["id"],
            format="full"
        ).execute()

        headers = msg["payload"]["headers"]

        subject = ""
        sender = ""
        date = ""

        for header in headers:
            if header["name"] == "Subject":
                subject = header["value"]
            elif header["name"] == "From":
                sender = header["value"]
            elif header["name"] == "Date":
                date = header["value"]

        body = extract_body(msg["payload"])

        print("=" * 80)
        print(f"Message ID : {message['id']}")
        print(f"From       : {sender}")
        print(f"Subject    : {subject}")
        print(f"Date       : {date}")
        print("\nBody:\n")
        print(body[:1000])
        print("=" * 80)


def extract_body(payload):

    if "parts" in payload:

        for part in payload["parts"]:

            if part["mimeType"] == "text/plain":

                data = part["body"].get("data")

                if data:
                    return base64.urlsafe_b64decode(data).decode("utf-8")

        for part in payload["parts"]:

            if "parts" in part:
                text = extract_body(part)

                if text:
                    return text

    else:

        data = payload["body"].get("data")

        if data:
            return base64.urlsafe_b64decode(data).decode("utf-8")

    return ""


if __name__ == "__main__":
    get_latest_emails()