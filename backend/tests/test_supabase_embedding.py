
import asyncio

from app.services import supabase as db
from app.services.embedding import LocalEmbeddingService


async def main():
    subject = "[TEST] MantriOS embedding retrieval test"
    body = (
        "Test petition: a student requests a review of a delayed "
        "university degree certificate."
    )

    canonical_text = (
        "Issue: Delay in issuing university degree certificate\n\n"
        "Petition Summary:\n"
        "The student requests review of the delay and issuance "
        "of the degree certificate.\n\n"
        "Requested Actions:\n"
        "- Review the delay\n"
        "- Issue the degree certificate"
    )

    # 1. Insert a dedicated test petition.
    petition_id = await db.insert_petition(
        subject=subject,
        body=body,
        status="pending",
    )
    print("Created test petition:", petition_id)

    # 2. Generate a 768-dimensional embedding.
    embedding = LocalEmbeddingService().generate_embedding(
        canonical_text
    )
    print("Embedding dimensions:", len(embedding))

    # 3. Store the embedding using the existing schema.
    stored = await db.store_petition_embedding(
        petition_id=petition_id,
        canonical_text=canonical_text,
        embedding=embedding,
        department_code="OTH",
        priority="NORMAL",
        summary="Test petition for embedding retrieval.",
    )

    print("Stored embedding record:", stored.get("id"))
    print("Storage test PASSED")


if __name__ == "__main__":
    asyncio.run(main())
