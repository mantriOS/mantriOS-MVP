from app.services.embedding import LocalEmbeddingService

service = LocalEmbeddingService()

vector = service.generate_embedding(
    "A student requests payment of an approved scholarship."
)

print("Dimensions:", len(vector))
print("First five values:", vector[:5])