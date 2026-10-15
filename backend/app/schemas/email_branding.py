from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# ── Email Branding Schemas ─────────────────────────────────────────────────────

class EmailBrandingResponse(BaseModel):
    id: str = "global_default"
    header_type: str = "image"  # 'image' or 'html'
    header_url: Optional[str] = None
    header_filename: Optional[str] = None
    header_html: Optional[str] = None
    footer_type: str = "image"  # 'image' or 'html'
    footer_url: Optional[str] = None
    footer_filename: Optional[str] = None
    footer_html: Optional[str] = None
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None


class EmailBrandingUpdateRequest(BaseModel):
    header_type: Optional[str] = None
    header_url: Optional[str] = None
    header_filename: Optional[str] = None
    header_html: Optional[str] = None
    footer_type: Optional[str] = None
    footer_url: Optional[str] = None
    footer_filename: Optional[str] = None
    footer_html: Optional[str] = None




# ── Shared Signature Schemas ──────────────────────────────────────────────────

class SignatureResponse(BaseModel):
    id: int
    name: str
    image_url: str
    filename: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = "officer"


class SignatureCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    image_url: str
    filename: Optional[str] = None


class SignatureUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    image_url: Optional[str] = None
    filename: Optional[str] = None


# ── Forward Petition Email Payload Schema ──────────────────────────────────────

class ForwardPetitionSendRequest(BaseModel):
    petition_id: int
    to: str
    cc: Optional[str] = None
    bcc: Optional[str] = None
    subject: str
    message: str
    notes: Optional[str] = None
    header_enabled: bool = False
    footer_enabled: bool = False
    signature_id: Optional[int] = None
    html_content: Optional[str] = None


class ForwardPetitionSendResponse(BaseModel):
    success: bool
    message: str
    petition_id: int
    recipient: str
    status: str
