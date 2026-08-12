from fastapi import APIRouter, HTTPException
import logging

from app.schemas.zapier import EmailRequest
from app.services.gemini import analyze_email
from app.services import supabase as db

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/zapier",
    tags=["Zapier"],
)

@router.get("/process-email")
async def home():
    return {"status": "ok"}


@router.post("/process-email", summary="Receive email from Zapier and process it")
async def process_email(request: EmailRequest):
    """
    Entry point for new emails forwarded by Zapier.

    Flow:
    1. Insert raw petition into `petitions` table with status='pending'.
    2. Run Gemini AI analysis on the email content.
    3. Insert AI results into `analysis` table linked to the petition.
    4. Update petition status to 'analysed'.
    5. Return full result including the petition_id for traceability.
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

    # ── Step 2: AI Analysis ──────────────────────────────────────────────────
    try:
        result = await analyze_email(
            subject=request.subject,
            body=request.body,
            headers=request.headers,
        )
        logger.info(
            "Gemini analysis done: petition_id=%s, department=%s, priority=%s",
            petition_id,
            result.get("department_code"),
            result.get("priority"),
        )
    except Exception as e:
        # Mark the petition as 'analysis_failed' so it's not lost
        try:
            await db.update_petition_status(petition_id, "analysis_failed")
        except Exception:
            pass  # Best-effort; don't mask the original error
        logger.error("Gemini analysis failed for petition_id=%s: %s", petition_id, e)
        raise HTTPException(
            status_code=500,
            detail=f"Gemini processing failed: {str(e)}",
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
        # Non-critical — don't fail the request over a status update
        logger.warning("Could not update petition status for id=%s: %s", petition_id, e)

    # ── Step 5: Return enriched response ────────────────────────────────────
    return {
        "petition_id": petition_id,
        "analysis_id": analysis_id,
        **result,
    }
