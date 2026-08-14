import json

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
    3. Look up the identified department from `departments`.
    4. Insert AI results into `analysis` table linked to the petition.
    5. Update petition status to 'analysed'.
    6. Return complete petition, analysis, and forwarding information.
    """

    # ── Step 1: Log petition to DB ──────────────────────────────────────
    try:
        petition_id = await db.insert_petition(
            subject=request.subject,
            body=request.body,
            status="pending",
        )

        logger.info(
            "Petition created: id=%s, subject=%r",
            petition_id,
            request.subject,
        )

    except Exception as e:
        logger.error("Failed to insert petition into DB: %s", e)

        raise HTTPException(
            status_code=500,
            detail=f"Database error while saving petition: {str(e)}",
        )

    # ── Step 2: AI Analysis ─────────────────────────────────────────────
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
        try:
            await db.update_petition_status(
                petition_id,
                "analysis_failed",
            )
        except Exception:
            pass

        logger.error(
            "Gemini analysis failed for petition_id=%s: %s",
            petition_id,
            e,
        )

        raise HTTPException(
            status_code=500,
            detail=f"Gemini processing failed: {str(e)}",
        )

    # ── Step 3: Resolve department from DB ──────────────────────────────
    department_code = result["department_code"]

    try:
        department = await db.get_department_by_code(
            department_code
        )

        if not department:
            logger.error(
                "Unknown department code returned by Gemini: %s",
                department_code,
            )

            await db.update_petition_status(
                petition_id,
                "analysis_failed",
            )

            raise HTTPException(
                status_code=501,
                detail=(
                    f"Department code '{department_code}' "
                    "does not exist in departments table."
                ),
            )

        logger.info(
            "Department resolved: %s -> %s (%s)",
            department_code,
            department["department_name"],
            department["official_email"],
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.error(
            "Failed to resolve department %s: %s",
            department_code,
            e,
        )

        raise HTTPException(
            status_code=500,
            detail=f"Database error while resolving department: {str(e)}",
        )

    # ── Step 4: Log analysis results ────────────────────────────────────
    try:
        print("\n===== GEMINI JSON RESULT =====")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        print("================================\n")
        analysis_id = await db.insert_analysis(
            petition_id=petition_id,
            summary=result["summary"],
            department_code=result["department_code"],
            priority=result["priority"],
            confidence=float(result["confidence"]),
            reason=result["reason"],
            forwarding_subject=result["forwarding_subject"],
            forwarding_body=result["forwarding_body"],
        )
       

        logger.info(
            "Analysis logged: analysis_id=%s, petition_id=%s",
            analysis_id,
            petition_id,
        )

    except Exception as e:
        logger.error(
            "Failed to insert analysis for petition_id=%s: %s",
            petition_id,
            e,
        )

        raise HTTPException(
            status_code=500,
            detail=f"Database error while saving analysis: {str(e)}",
        )

    # ── Step 5: Mark petition as analysed ───────────────────────────────
    try:
        await db.update_petition_status(
            petition_id,
            "analysed",
        )

    except Exception as e:
        logger.warning(
            "Could not update petition status for id=%s: %s",
            petition_id,
            e,
        )

    # ── Step 6: Return enriched response ────────────────────────────────
    return {
        "petition_id": petition_id,
        "analysis_id": analysis_id,

        "summary": result["summary"],
        "department_code": department_code,
        "priority": result["priority"],
        "confidence": result["confidence"],
        "reason": result["reason"],

        "department": {
            "code": department_code,
            "name": department["department_name"],
            "email": department["official_email"],
        },

        "forwarding": {
            "subject": result["forwarding_subject"],
            "body": result["forwarding_body"],
        },
    }