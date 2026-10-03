from fastapi import APIRouter, HTTPException
import logging

from app.schemas.email_webhook import EmailRequest
from app.services.bedrock import analyze_email
from app.services import supabase as db
from app.services.s3 import upload_attachment_to_s3

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/email_webhook",
    tags=["Email Webhook"],
)

@router.get("/process-email")
async def home():
    return {"status": "ok"}


@router.post("/process-email", summary="Receive email from Lambda/Webhook and process it")
async def process_email(request: EmailRequest):
    """
    Entry point for new emails forwarded by AWS Lambda poller.

    Flow:
    1. Insert raw petition into `petitions` table with status='pending'.
    2. Upload any attachments to AWS S3.
    3. Run AWS Bedrock Gemma 3 27B AI analysis on the email content (including attachments).
    4. Insert AI results into `analysis` table linked to the petition.
    5. Update petition status to 'analysed'.
    6. Return full result including the petition_id for traceability.
    """

    # ── Step 1: Log petition to DB ──────────────────────────────────────────
    try:
        petition_id = await db.insert_petition(
            subject=request.subject,
            body=request.body,
            status="pending",
        )
        logger.info("Petition created: id=%s, subject=%r", petition_id, request.subject)
    except Exception as e:
        logger.error("Failed to insert petition into DB: %s", e)
        raise HTTPException(
            status_code=500,
            detail=f"Database error while saving petition: {str(e)}",
        )

    # ── Step 1.5: Process Attachments and upload to S3 ───────────────────────
    try:
        for attachment in request.attachments:
            if attachment.data_base64:
                # Upload to S3
                s3_url = await upload_attachment_to_s3(
                    petition_id=petition_id,
                    filename=attachment.filename,
                    content_type=attachment.content_type,
                    data_base64=attachment.data_base64
                )
                attachment.s3_url = s3_url
    except Exception as e:
        logger.error("Failed to upload attachments to S3 for petition_id=%s: %s", petition_id, e)
        # Continue even if S3 upload fails, or fail the request depending on requirements.
        # Let's fail so the Lambda doesn't mark the email as processed if attachments fail.
        raise HTTPException(status_code=500, detail=f"Failed to process attachments: {str(e)}")

    # ── Step 2: AI Analysis ──────────────────────────────────────────────────
    try:
        result = await analyze_email(
            subject=request.subject,
            body=request.body,
            headers=request.headers,
            attachments=request.attachments,
        )
        logger.info(
            "Bedrock analysis done: petition_id=%s, department=%s, priority=%s",
            petition_id,
            result.get("department_code"),
            result.get("priority"),
        )
    except Exception as e:
        try:
            await db.update_petition_status(petition_id, "analysis_failed")
        except Exception:
            pass
        logger.error("Bedrock analysis failed for petition_id=%s: %s", petition_id, e)
        raise HTTPException(
            status_code=500,
            detail=f"Bedrock processing failed: {str(e)}",
        )

    # ── Step 3: Log analysis results to DB ──────────────────────────────────
    try:
        analysis_id = await db.insert_analysis(
            petition_id=petition_id,
            summary=result["summary"],
            department_code=result["department_code"],
            priority=result["priority"],
            confidence=float(result["confidence"]),
            reason=result["reason"],
        )
        logger.info("Analysis logged: analysis_id=%s, petition_id=%s", analysis_id, petition_id)
    except Exception as e:
        logger.error("Failed to insert analysis for petition_id=%s: %s", petition_id, e)
        raise HTTPException(
            status_code=500,
            detail=f"Database error while saving analysis: {str(e)}",
        )

    # ── Step 4: Mark petition as analysed ───────────────────────────────────
    try:
        await db.update_petition_status(petition_id, "analysed")
    except Exception as e:
        logger.warning("Could not update petition status for id=%s: %s", petition_id, e)

    # ── Step 5: Return enriched response ────────────────────────────────────
    return {
        "petition_id": petition_id,
        "analysis_id": analysis_id,
        **result,
    }
