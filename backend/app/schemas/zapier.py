from typing import Dict, Any
from pydantic import BaseModel, Field


class EmailRequest(BaseModel):
    subject: str
    body: str
    headers: Dict[str, Any] = Field(default_factory=dict)
