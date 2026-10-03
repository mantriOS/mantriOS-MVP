from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class EmailAttachment(BaseModel):
    filename: str
    content_type: str
    size_bytes: int
    data_base64: str  # base64 encoded bytes
    s3_url: Optional[str] = None

class EmailRequest(BaseModel):
    subject: str
    body: str
    headers: Dict[str, Any] = Field(default_factory=dict)
    attachments: List[EmailAttachment] = Field(default_factory=list)
