
import asyncio

from app.services.context_builder import build_dynamic_context
from app.services.embedding import LocalEmbeddingService


async def main():
    # Uses the two retrieval-test records created earlier:
    # 170 = delayed degree certificate
    # 171 = university certificate not received
    current_petition_id = 171

    canonical_text = """
    Issue: Delayed university certificate
    Petition Summary: The applicant has not received a degree certificate.
    Requested Actions: Request the university to issue the certificate.
    """

    embedding = LocalEmbeddingService().generate_embedding(canonical_text)

    result = await build_dynamic_context(
        current_petition_id=current_petition_id,
        canonical_text=canonical_text,
        embedding=embedding,
        top_k=5,
    )

    print("\n--- RETRIEVAL SUMMARY ---")
    print("Historical cases retrieved:", result["retrieved_count"])
    print("Matches:", result["retrieved_cases"])

    print("\n--- DYNAMIC CONTEXT ---")
    print(result["context_text"])

    assert "CURRENT PETITION" in result["context_text"]
    assert "SIMILAR HISTORICAL PETITIONS" in result["context_text"]
    assert all(
        case["petition_id"] != current_petition_id
        for case in result["retrieved_cases"]
    )

    print("\n[PASS] Dynamic context builder")


if __name__ == "__main__":
    asyncio.run(main())
