import logging
import uuid
from typing import List, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.schemas.email_branding import (
    EmailBrandingResponse,
    EmailBrandingUpdateRequest,
    ForwardPetitionSendRequest,
    ForwardPetitionSendResponse,
    SignatureCreateRequest,
    SignatureResponse,
    SignatureUpdateRequest,
)
from app.services import email_sender
from app.services import s3
from app.services import supabase as db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/branding", tags=["Email Branding & Signatures"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def _validate_image(file: UploadFile) -> None:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image format: {file.content_type}. Supported formats: JPEG, PNG, WEBP, GIF.",
        )


# ── Global Email Branding (Header & Footer) ───────────────────────────────────

@router.get("/config", response_model=EmailBrandingResponse)
async def get_branding_config():
    """Returns the currently active global header and footer image configuration."""
    try:
        config = await db.get_email_branding()
        header_url = config.get("header_url")
        header_filename = config.get("header_filename") or ""

        # Check if header is an HTML template or image
        header_type = "html" if header_filename.endswith(".html") else "image"
        header_html = None

        if header_type == "html" and header_url:
            try:
                import httpx
                async with httpx.AsyncClient(timeout=5.0) as client:
                    resp = await client.get(header_url)
                    if resp.status_code == 200:
                        header_html = resp.text
            except Exception as e:
                logger.warning("Could not fetch header HTML from S3: %s", e)

        # Check if footer is an HTML template or image
        footer_url = config.get("footer_url")
        footer_filename = config.get("footer_filename") or ""
        footer_type = "html" if footer_filename.endswith(".html") else "image"
        footer_html = None

        if footer_type == "html" and footer_url:
            try:
                import httpx
                async with httpx.AsyncClient(timeout=5.0) as client:
                    resp = await client.get(footer_url)
                    if resp.status_code == 200:
                        footer_html = resp.text
            except Exception as e:
                logger.warning("Could not fetch footer HTML from S3: %s", e)

        return EmailBrandingResponse(
            id=config.get("id", "global_default"),
            header_type=header_type,
            header_url=header_url,
            header_filename=header_filename,
            header_html=header_html,
            footer_type=footer_type,
            footer_url=footer_url,
            footer_filename=footer_filename,
            footer_html=footer_html,
            updated_at=config.get("updated_at"),
            updated_by=config.get("updated_by"),
        )
    except Exception as exc:
        logger.exception("Failed to retrieve email branding configuration")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve email branding configuration.",
        ) from exc



@router.post("/upload/header", response_model=EmailBrandingResponse)
async def upload_header(file: UploadFile = File(...)):
    """Uploads and activates the global official header image."""
    _validate_image(file)
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Image file exceeds maximum allowable size of 5MB.",
            )

        filename = f"header_{uuid.uuid4().hex[:8]}_{file.filename}"
        s3_url = await s3.upload_branding_asset_to_s3(
            category="header",
            filename=filename,
            content_type=file.content_type,
            data_bytes=content,
        )

        updated = await db.update_email_branding(
            header_url=s3_url,
            header_filename=file.filename,
        )
        return EmailBrandingResponse(
            **updated,
            header_type="image",
            header_html=None,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to upload header image")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not upload header image.",
        ) from exc


@router.post("/header/html", response_model=EmailBrandingResponse)
async def save_html_header(payload: EmailBrandingUpdateRequest):
    """Saves custom HTML template for the official global header by uploading to S3."""
    try:
        html_content = (payload.header_html or "").strip()
        filename = f"header_template_{uuid.uuid4().hex[:8]}.html"
        
        s3_url = await s3.upload_branding_asset_to_s3(
            category="header",
            filename=filename,
            content_type="text/html; charset=utf-8",
            data_bytes=html_content.encode("utf-8"),
        )

        updated = await db.update_email_branding(
            header_url=s3_url,
            header_filename=filename,
        )
        return EmailBrandingResponse(
            **updated,
            header_type="html",
            header_html=html_content,
        )
    except Exception as exc:
        logger.exception("Failed to save HTML header")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not save HTML header.",
        ) from exc




@router.delete("/header", response_model=EmailBrandingResponse)
async def remove_header():
    """Removes the active global header image."""
    try:
        updated = await db.update_email_branding(
            header_url="",
            header_filename="",
        )
        return updated
    except Exception as exc:
        logger.exception("Failed to remove header image")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not remove header image.",
        ) from exc


@router.post("/upload/footer", response_model=EmailBrandingResponse)
async def upload_footer(file: UploadFile = File(...)):
    """Uploads and activates the global official footer image."""
    _validate_image(file)
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Image file exceeds maximum allowable size of 5MB.",
            )

        filename = f"footer_{uuid.uuid4().hex[:8]}_{file.filename}"
        s3_url = await s3.upload_branding_asset_to_s3(
            category="footer",
            filename=filename,
            content_type=file.content_type,
            data_bytes=content,
        )

        updated = await db.update_email_branding(
            footer_url=s3_url,
            footer_filename=file.filename,
        )
        return EmailBrandingResponse(
            **updated,
            footer_type="image",
            footer_html=None,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to upload footer image")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not upload footer image.",
        ) from exc


@router.post("/footer/html", response_model=EmailBrandingResponse)
async def save_html_footer(payload: EmailBrandingUpdateRequest):
    """Saves custom HTML template for the official global footer by uploading to S3."""
    try:
        html_content = (payload.footer_html or "").strip()
        filename = f"footer_template_{uuid.uuid4().hex[:8]}.html"

        s3_url = await s3.upload_branding_asset_to_s3(
            category="footer",
            filename=filename,
            content_type="text/html; charset=utf-8",
            data_bytes=html_content.encode("utf-8"),
        )

        updated = await db.update_email_branding(
            footer_url=s3_url,
            footer_filename=filename,
        )
        return EmailBrandingResponse(
            **updated,
            footer_type="html",
            footer_html=html_content,
        )
    except Exception as exc:
        logger.exception("Failed to save HTML footer")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not save HTML footer.",
        ) from exc


@router.delete("/footer", response_model=EmailBrandingResponse)
async def remove_footer():
    """Removes the active global footer image."""
    try:
        updated = await db.update_email_branding(
            footer_url="",
            footer_filename="",
        )
        return updated
    except Exception as exc:
        logger.exception("Failed to remove footer image")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not remove footer image.",
        ) from exc



# ── Shared Signature Library ──────────────────────────────────────────────────

@router.get("/signatures", response_model=List[SignatureResponse])
async def list_signatures():
    """Retrieves all available shared signatures from the library."""
    try:
        return await db.list_signatures()
    except Exception as exc:
        logger.exception("Failed to list signatures")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve signatures.",
        ) from exc


@router.post("/signatures", response_model=SignatureResponse)
async def create_signature(
    name: str = Form(...),
    file: UploadFile = File(...),
):
    """Uploads a new shared signature image to the library."""
    _validate_image(file)
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Signature file exceeds maximum allowable size of 5MB.",
            )

        filename = f"sig_{uuid.uuid4().hex[:8]}_{file.filename}"
        s3_url = await s3.upload_branding_asset_to_s3(
            category="signatures",
            filename=filename,
            content_type=file.content_type,
            data_bytes=content,
        )

        sig = await db.create_signature(
            name=name.strip(),
            image_url=s3_url,
            filename=file.filename,
        )
        return sig
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to create signature")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not upload and save signature.",
        ) from exc


@router.patch("/signatures/{signature_id}", response_model=SignatureResponse)
async def update_signature(
    signature_id: int,
    name: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    """Updates an existing signature's label or replaces its image."""
    try:
        existing = await db.get_signature(signature_id)
        if not existing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Signature not found.")

        new_image_url = None
        new_filename = None

        if file:
            _validate_image(file)
            content = await file.read()
            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Signature file exceeds maximum allowable size of 5MB.",
                )
            new_filename = f"sig_{uuid.uuid4().hex[:8]}_{file.filename}"
            new_image_url = await s3.upload_branding_asset_to_s3(
                category="signatures",
                filename=new_filename,
                content_type=file.content_type,
                data_bytes=content,
            )

        updated = await db.update_signature(
            sig_id=signature_id,
            name=name.strip() if name else None,
            image_url=new_image_url,
            filename=file.filename if file else None,
        )
        return updated
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to update signature %s", signature_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update signature.",
        ) from exc


@router.delete("/signatures/{signature_id}")
async def delete_signature(signature_id: int):
    """Deletes a signature from the shared library."""
    try:
        success = await db.delete_signature(signature_id)
        return {"success": success, "deleted_id": signature_id}
    except Exception as exc:
        logger.exception("Failed to delete signature %s", signature_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not delete signature.",
        ) from exc


# ── Forward Petition Action Dispatch (Outbound SMTP via Gmail) ────────────────

@router.post("/forward-petition", response_model=ForwardPetitionSendResponse)
async def send_forward_petition(request: ForwardPetitionSendRequest):
    """
    Receives forwarded petition dispatch instructions with applied branding/signature.
    Sends the outbound email via SMTP and updates the petition status to 'forwarded'.
    """
    try:
        # 1. Fetch current branding configuration if header or footer is enabled
        branding_config = None
        if request.header_enabled or request.footer_enabled:
            try:
                raw_config = await db.get_email_branding()
                header_url = raw_config.get("header_url")
                header_filename = raw_config.get("header_filename") or ""
                header_type = "html" if header_filename.endswith(".html") else "image"
                header_html = None

                if header_type == "html" and header_url:
                    try:
                        import httpx
                        async with httpx.AsyncClient(timeout=5.0) as client:
                            resp = await client.get(header_url)
                            if resp.status_code == 200:
                                header_html = resp.text
                    except Exception as err:
                        logger.warning("Could not fetch header HTML: %s", err)

                footer_url = raw_config.get("footer_url")
                footer_filename = raw_config.get("footer_filename") or ""
                footer_type = "html" if footer_filename.endswith(".html") else "image"
                footer_html = None

                if footer_type == "html" and footer_url:
                    try:
                        import httpx
                        async with httpx.AsyncClient(timeout=5.0) as client:
                            resp = await client.get(footer_url)
                            if resp.status_code == 200:
                                footer_html = resp.text
                    except Exception as err:
                        logger.warning("Could not fetch footer HTML: %s", err)

                branding_config = {
                    "header_type": header_type,
                    "header_url": header_url,
                    "header_html": header_html,
                    "footer_type": footer_type,
                    "footer_url": footer_url,
                    "footer_html": footer_html,
                }
            except Exception as e:
                logger.warning("Failed to fetch branding config for forward email: %s", e)

        # 2. Compose branded HTML email content
        raw_body = request.html_content or f"<p>{request.message}</p>"
        composed_html = email_sender.compose_branded_html(
            body_html=raw_body,
            header_enabled=request.header_enabled,
            footer_enabled=request.footer_enabled,
            branding_config=branding_config,
        )

        # 3. Dispatch outbound email via SMTP
        await email_sender.send_smtp_email(
            to=request.to,
            subject=request.subject,
            html_content=composed_html,
            text_content=request.message,
            cc=request.cc,
            bcc=request.bcc,
        )

        # 4. Update petition status in Supabase to 'forwarded'
        await db.update_petition_status(request.petition_id, "forwarded")
        logger.info(
            "Successfully sent forward email for petition #%s to %s with branding (header=%s, footer=%s, sig=%s)",
            request.petition_id,
            request.to,
            request.header_enabled,
            request.footer_enabled,
            request.signature_id,
        )

        return ForwardPetitionSendResponse(
            success=True,
            message="Petition successfully forwarded with official branding via email.",
            petition_id=request.petition_id,
            recipient=request.to,
            status="forwarded",
        )
    except Exception as exc:
        logger.exception("Failed to forward petition #%s", request.petition_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to forward petition email: {str(exc)}",
        ) from exc
