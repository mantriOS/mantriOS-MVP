from app.services.petition_text import canonical_petition_to_text
from app.services.embedding import LocalEmbeddingService

canonical = {
    "issue": "Delay in university certificate issuance",
    "petition_summary": "A student has not received a degree certificate.",
    "facts": [
        "The course was completed in 2025.",
        "The certificate remains pending.",
    ],
    "requested_actions": ["Issue the pending certificate."],
}

sequential_text = canonical_petition_to_text(canonical)

print("=== SEQUENTIAL PETITION TEXT ===")
print(sequential_text)

embedding = LocalEmbeddingService().generate_embedding(sequential_text)

print("\n=== EMBEDDING RESULT ===")
print("Dimensions:", len(embedding))
print("First 5 values:", embedding[:5])