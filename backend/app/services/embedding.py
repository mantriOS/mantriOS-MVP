
from functools import lru_cache

from sentence_transformers import SentenceTransformer


MODEL_NAME = "BAAI/bge-base-en-v1.5"
EMBEDDING_DIMENSIONS = 768


@lru_cache(maxsize=1)
def _load_model() -> SentenceTransformer:
    """Load the local embedding model once and reuse it."""
    return SentenceTransformer(MODEL_NAME)


class LocalEmbeddingService:
    """Generate normalized embeddings locally without a cloud API."""

    def __init__(self) -> None:
        self.dimensions = EMBEDDING_DIMENSIONS
        self.model_name = MODEL_NAME

    def generate_embedding(self, text: str) -> list[float]:
        if not text or not text.strip():
            raise ValueError("Cannot generate embedding for empty text")

        model = _load_model()

        embedding = model.encode(
            text.strip(),
            normalize_embeddings=True,
            convert_to_numpy=True,
        )

        if embedding.shape != (self.dimensions,):
            raise RuntimeError(
                f"Expected {self.dimensions} dimensions, "
                f"got {embedding.shape}"
            )

        return embedding.tolist()
