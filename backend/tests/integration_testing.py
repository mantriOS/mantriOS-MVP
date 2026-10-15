
import asyncio
import json
import math

from app.services import supabase as db
from app.services.bedrock import analyze_email, canonicalize_petition
from app.services.embedding import LocalEmbeddingService
from app.services.petition_text import canonical_petition_to_text
from app.services.context_builder import build_dynamic_context


ALLOWED_DEPARTMENTS = {"SCH", "DHE", "DTE", "UNI", "INF", "ADM", "OTH"}
ALLOWED_PRIORITIES = {"LOW", "MEDIUM", "HIGH"}
REQUIRED_KEYS = {
    "summary", "department_code", "priority", "confidence", "reason"
}


def unwrap_canonical(value):
    """Accept either the canonical object or its documented wrapper."""
    if not isinstance(value, dict):
        raise ValueError("Canonicalization did not return a JSON object")

    canonical = value.get("canonical_petition", value)

    if not isinstance(canonical, dict):
        raise ValueError("canonical_petition must be a JSON object")

    return canonical


def validate_analysis(result):
    """Validate the actual LLM output before persisting it."""
    if not isinstance(result, dict):
        raise ValueError("Analysis result must be a JSON object")

    missing = REQUIRED_KEYS - result.keys()
    if missing:
        raise ValueError(f"Missing analysis keys: {sorted(missing)}")

    if result["department_code"] not in ALLOWED_DEPARTMENTS:
        raise ValueError(
            f"Invalid department code: {result['department_code']!r}"
        )

    if result["priority"] not in ALLOWED_PRIORITIES:
        raise ValueError(f"Invalid priority: {result['priority']!r}")

    confidence = result["confidence"]
    if (
        isinstance(confidence, bool)
        or not isinstance(confidence, (int, float))
        or not math.isfinite(confidence)
        or not 0 <= confidence <= 1
    ):
        raise ValueError(f"Invalid confidence: {confidence!r}")

    if not isinstance(result["summary"], str) or not result["summary"].strip():
        raise ValueError("Summary must be a non-empty string")

    # Basic whitespace-based word count for the required 50-word summary.
    word_count = len(result["summary"].split())
    if word_count != 50:
        raise ValueError(
            f"Summary must contain exactly 50 words; got {word_count}. "
            "Do not persist this result until corrected."
        )

    if not isinstance(result["reason"], str) or not result["reason"].strip():
        raise ValueError("Reason must be a non-empty string")


async def main():
    # This is a synthetic petition, not real citizen data.
    subject = "[TEST] Delayed university degree certificate"
    body = (
        "A graduate states that the university has not issued their "
        "degree certificate despite completing the required course and "
        "waiting several months. The applicant requests that the delay "
        "be reviewed and that the certificate be issued if all requirements "
        "have been satisfied."
    )
    headers = {
        "x-test-run": "full-rag-pipeline",
        "source": "synthetic-test",
    }

    petition_id = None
    embedder = LocalEmbeddingService()

    print("\n1. Creating synthetic petition...")
    petition_id = int(
        await db.insert_petition(
            subject=subject,
            body=body,
            status="pending",
        )
    )
    print(f"[PASS] Created petition {petition_id}")

    # ---------------------------------------------------------
    # 2. First real Gemma call: canonicalize the petition.
    # ---------------------------------------------------------
    print("\n2. Calling Gemma for canonicalization...")

    canonical_result = await canonicalize_petition(
        subject=subject,
        body=body,
        headers=headers,
        attachments=None,
    )
    canonical = unwrap_canonical(canonical_result)

    canonical_text = canonical_petition_to_text(canonical)
    if not canonical_text.strip():
        raise ValueError("Canonical petition text is empty")

    print("[PASS] Canonicalization")
    print("Canonical text preview:")
    print(canonical_text[:800])

    # ---------------------------------------------------------
    # 3. Generate and persist the current petition embedding.
    # ---------------------------------------------------------
    print("\n3. Generating and storing embedding...")

    embedding = embedder.generate_embedding(canonical_text)
    assert len(embedding) == 768

    await db.store_petition_embedding(
        petition_id=petition_id,
        canonical_text=canonical_text,
        embedding=embedding,
    )

    print("[PASS] 768-dimensional embedding stored")

    # ---------------------------------------------------------
    # 4. Retrieve historical petitions and build dynamic context.
    # ---------------------------------------------------------
    print("\n4. Retrieving historical petitions...")

    context_result = await build_dynamic_context(
        current_petition_id=petition_id,
        canonical_text=canonical_text,
        embedding=embedding,
        top_k=5,
    )

    print(
        f"[PASS] Context built with "
        f"{context_result['retrieved_count']} historical case(s)"
    )

    for case in context_result["retrieved_cases"]:
        print(
            f"  ID={case['petition_id']} "
            f"similarity={case['similarity']} "
            f"has_analysis={case['has_analysis']}"
        )

    if context_result["retrieved_count"] == 0:
        print(
            "[WARNING] No historical cases found. "
            "The final Gemma call will run without historical examples."
        )

    # ---------------------------------------------------------
    # 5. Second real Gemma call: master prompt + dynamic context.
    # ---------------------------------------------------------
    print("\n5. Calling Gemma for RAG-enhanced analysis...")

    result = await analyze_email(
        subject=subject,
        body=body,
        headers=headers,
        attachments=None,
        additional_context=context_result["context_text"],
    )

    print("[PASS] Gemma returned an analysis")
    print(json.dumps(result, indent=2, ensure_ascii=False))

    # ---------------------------------------------------------
    # 6. Validate before writing the result.
    # ---------------------------------------------------------
    print("\n6. Validating model output...")
    validate_analysis(result)
    print("[PASS] Output schema, department, priority, confidence, and 50-word summary")

    # ---------------------------------------------------------
    # 7. Persist the analysis and update the petition status.
    # ---------------------------------------------------------
    print("\n7. Saving analysis...")

    await db.insert_analysis(
        petition_id=petition_id,
        summary=result["summary"],
        department_code=result["department_code"],
        priority=result["priority"],
        confidence=float(result["confidence"]),
        reason=result["reason"],
    )

    await db.update_petition_status(petition_id, "analysed")

    print("[PASS] Analysis saved and petition status updated")
    print("\nFULL RAG PIPELINE PASSED")
    print(f"Test petition ID: {petition_id}")
    print("This synthetic test record remains in Supabase.")


if __name__ == "__main__":
    asyncio.run(main())
