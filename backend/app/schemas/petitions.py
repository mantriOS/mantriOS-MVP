from typing import Optional

from pydantic import BaseModel, Field


class DepartmentResponse(BaseModel):
    code: str
    name: str
    email: str


class ForwardingResponse(BaseModel):
    subject: str
    body: str


class AnalysisResponse(BaseModel):
    summary: str
    department_code: str
    priority: str
    confidence: float
    reason: str
    department: Optional[DepartmentResponse] = None
    forwarding: Optional[ForwardingResponse] = None


class PetitionResponse(BaseModel):
    id: int
    subject: str
    body: str
    status: str
    analysis: Optional[AnalysisResponse] = None


class PetitionListResponse(BaseModel):
    items: list[PetitionResponse]
    total: int = Field(ge=0)
    page: int = Field(ge=1)
    page_size: int = Field(ge=1)
    total_pages: int = Field(ge=0)


class CountByValue(BaseModel):
    value: str
    count: int = Field(ge=0)


class DashboardStatsResponse(BaseModel):
    total: int = Field(ge=0)
    pending: int = Field(ge=0)
    analysed: int = Field(ge=0)
    high_priority: int = Field(ge=0)
    forwarded: int = Field(ge=0)
    recent: list[PetitionResponse]
    urgent: list[PetitionResponse]
    by_department: list[CountByValue]


class AnalyticsResponse(BaseModel):
    total: int = Field(ge=0)
    resolved: int = Field(ge=0)
    rejected: int = Field(ge=0)
    open: int = Field(ge=0)
    resolution_rate: int = Field(ge=0, le=100)
    by_department: list[CountByValue]
    by_priority: list[CountByValue]
    by_status: list[CountByValue]