import asyncio
import logging
import os
import smtplib
from email.message import EmailMessage
from pathlib import Path
from typing import Any, Dict, List, Optional
from dotenv import load_dotenv

backend_dir = Path(__file__).resolve().parent.parent.parent
env_file = backend_dir / ".env"
load_dotenv(dotenv_path=env_file)
load_dotenv()

logger = logging.getLogger(__name__)

# Outbound SMTP configuration
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER") or os.getenv("IMAP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD") or os.getenv("IMAP_PASSWORD", "")
DEFAULT_FROM = os.getenv("FROM_EMAIL") or SMTP_USER
SENDER_DISPLAY_NAME = os.getenv("SENDER_DISPLAY_NAME", "MantriOS Minister Office")


def compose_branded_html(
    body_html: str,
    header_enabled: bool = False,
    footer_enabled: bool = False,
    branding_config: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Wraps the email body in official branding (header/footer) and responsive container styling.
    """
    header_section = ""
    footer_section = ""

    if header_enabled and branding_config:
        header_type = branding_config.get("header_type", "image")
        header_html = branding_config.get("header_html")
        header_url = branding_config.get("header_url")

        if header_type == "html" and header_html:
            header_section = f'<div class="email-header">{header_html}</div>'
        elif header_url:
            header_section = (
                f'<div class="email-header" style="text-align: center; padding: 12px 16px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">'
                f'<img src="{header_url}" alt="Official Header" style="max-width: 100%; max-height: 140px; height: auto; object-fit: contain; display: block; margin: 0 auto;" />'
                f'</div>'
            )

    if footer_enabled and branding_config:
        footer_type = branding_config.get("footer_type", "image")
        footer_html = branding_config.get("footer_html")
        footer_url = branding_config.get("footer_url")

        if footer_type == "html" and footer_html:
            footer_section = f'<div class="email-footer">{footer_html}</div>'
        elif footer_url:
            footer_section = (
                f'<div class="email-footer" style="text-align: center; padding: 12px 16px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; margin-top: 24px;">'
                f'<img src="{footer_url}" alt="Official Footer" style="max-width: 100%; max-height: 100px; height: auto; object-fit: contain; display: block; margin: 0 auto;" />'
                f'</div>'
            )

    full_html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MantriOS Official Correspondence</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
    }}
    .email-wrapper {{
      width: 100%;
      background-color: #f1f5f9;
      padding: 24px 12px;
      box-sizing: border-box;
    }}
    .email-container {{
      max-width: 680px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
    }}
    .email-content {{
      padding: 28px 32px;
      font-size: 14px;
      line-height: 1.7;
      color: #334155;
    }}
    .email-content p {{
      margin-top: 0;
      margin-bottom: 1em;
    }}
    .email-content img {{
      max-width: 100%;
      height: auto;
    }}
    .email-meta-box {{
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 20px;
      font-size: 12px;
      color: #64748b;
    }}
    @media only screen and (max-width: 600px) {{
      .email-content {{
        padding: 20px 16px;
      }}
      .email-wrapper {{
        padding: 12px 4px;
      }}
    }}
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      {header_section}
      <div class="email-content">
        {body_html}
      </div>
      {footer_section}
    </div>
  </div>
</body>
</html>"""
    return full_html


def _parse_recipient_list(recipients_raw: Optional[str]) -> List[str]:
    """Parse comma/semicolon-separated string into a list of cleaned email addresses."""
    if not recipients_raw:
        return []
    cleaned = []
    # Replace semicolons with commas and split
    for item in recipients_raw.replace(";", ",").split(","):
        addr = item.strip()
        if addr:
            cleaned.append(addr)
    return cleaned


def _send_smtp_sync(
    to: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None,
    cc: Optional[str] = None,
    bcc: Optional[str] = None,
    attachments: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Synchronous SMTP sender using Python's standard library.
    Executes STARTTLS connection and message delivery.
    """
    user = os.getenv("SMTP_USER") or os.getenv("IMAP_USER", "")
    password = os.getenv("SMTP_PASSWORD") or os.getenv("IMAP_PASSWORD", "")
    host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    port = int(os.getenv("SMTP_PORT", "587"))
    from_addr = os.getenv("FROM_EMAIL") or user

    if not user or not password:
        raise ValueError(
            "Outbound SMTP credentials not configured. Please set SMTP_USER and SMTP_PASSWORD "
            "(or IMAP_USER and IMAP_PASSWORD) in backend/.env"
        )

    to_list = _parse_recipient_list(to)
    if not to_list:
        raise ValueError("No valid recipient email address specified in 'to'.")

    cc_list = _parse_recipient_list(cc)
    bcc_list = _parse_recipient_list(bcc)
    all_recipients = to_list + cc_list + bcc_list

    msg = EmailMessage()
    msg["Subject"] = subject

    if SENDER_DISPLAY_NAME:
        msg["From"] = f"{SENDER_DISPLAY_NAME} <{from_addr}>"
    else:
        msg["From"] = from_addr

    msg["To"] = ", ".join(to_list)
    if cc_list:
        msg["Cc"] = ", ".join(cc_list)

    # Fallback plain-text version
    plain_text = text_content or "This is an official correspondence from MantriOS. Please view in an HTML-compatible email client."
    msg.set_content(plain_text)

    # Rich HTML version
    msg.add_alternative(html_content, subtype="html")

    # Optional attachments
    if attachments:
        for att in attachments:
            data = att.get("content_bytes")
            filename = att.get("filename", "attachment.bin")
            content_type = att.get("content_type", "application/octet-stream")
            if data:
                maintype, _, subtype = content_type.partition("/")
                msg.add_attachment(
                    data,
                    maintype=maintype or "application",
                    subtype=subtype or "octet-stream",
                    filename=filename,
                )

    logger.info(
        "Connecting to SMTP server %s:%d (user=%s) to send email to %s",
        host,
        port,
        user,
        to_list,
    )

    with smtplib.SMTP(host=host, port=port, timeout=30) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(user, password)
        server.send_message(msg, from_addr=from_addr, to_addrs=all_recipients)

    logger.info("Successfully sent email via SMTP to %s", all_recipients)
    return {
        "success": True,
        "recipients": all_recipients,
        "subject": subject,
    }


async def send_smtp_email(
    to: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None,
    cc: Optional[str] = None,
    bcc: Optional[str] = None,
    attachments: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Non-blocking async wrapper around standard SMTP sending.
    Runs the network I/O in an executor thread.
    """
    return await asyncio.to_thread(
        _send_smtp_sync,
        to=to,
        subject=subject,
        html_content=html_content,
        text_content=text_content,
        cc=cc,
        bcc=bcc,
        attachments=attachments,
    )
