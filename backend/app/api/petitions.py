import logging
from collections import Counter
from math import ceil
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.schemas.petitions import (
    AnalyticsResponse,
    CountByValue,
    DashboardStatsResponse,
    PetitionListResponse,
    PetitionResponse,
)
from app.services import supabase as db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["Petitions"])


def _normalise(value: Optional[str]) -> Optional[str]:
    return value.strip() if value and value.strip() else None


def _count_items(values: list[Optional[str]]) -> list[CountByValue]:
    counts = Counter(value for value in values if value)
    return [CountByValue(value=value, count=count) for value, count in counts.most_common()]


@router.get("/petitions", response_model=PetitionListResponse)
async def list_petitions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    department: Optional[str] = None,
    search: Optional[str] = Query(None, max_length=200),
) -> PetitionListResponse:
    """Return paginated petitions with optional real database-backed filters."""
    try:
        petitions = await db.list_petitions(
            status=_normalise(status),
            priority=_normalise(priority),
            department=_normalise(department),
            search=_normalise(search),
        )
    except Exception as exc:
        logger.exception("Could not list petitions")
        raise HTTPException(status_code=502, detail="Unable to retrieve petitions.") from exc

    total = len(petitions)
    start = (page - 1) * page_size
    items = petitions[start : start + page_size]
    return PetitionListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=ceil(total / page_size) if total else 0,
    )


@router.get("/petitions/{petition_id}", response_model=PetitionResponse)
async def get_petition(petition_id: int) -> PetitionResponse:
    try:
        petition = await db.get_petition(petition_id)
    except Exception as exc:
        logger.exception("Could not retrieve petition %s", petition_id)
        raise HTTPException(status_code=502, detail="Unable to retrieve the petition.") from exc
    if petition is None:
        raise HTTPException(status_code=404, detail="Petition not found.")
    return petition


@router.get("/dashboard", response_model=DashboardStatsResponse)
async def get_dashboard() -> DashboardStatsResponse:
    try:
        petitions = await db.list_petitions()
    except Exception as exc:
        logger.exception("Could not build dashboard")
        raise HTTPException(status_code=502, detail="Unable to retrieve dashboard data.") from exc

    status_counts = Counter(p["status"].lower() for p in petitions)
    urgent = [
        p for p in petitions
        if p["analysis"] and p["analysis"]["priority"].upper() == "HIGH"
        and p["status"].lower() not in {"resolved", "rejected"}
    ][:4]
    return DashboardStatsResponse(
        total=len(petitions),
        pending=status_counts["pending"],
        analysed=sum(1 for p in petitions if p["analysis"] is not None),
        high_priority=sum(1 for p in petitions if p["analysis"] and p["analysis"]["priority"].upper() == "HIGH"),
        forwarded=status_counts["forwarded"],
        recent=petitions[:6],
        urgent=urgent,
        by_department=_count_items([p["analysis"]["department_code"] if p["analysis"] else None for p in petitions]),
    )


@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics() -> AnalyticsResponse:
    try:
        petitions = await db.list_petitions()
    except Exception as exc:
        logger.exception("Could not build analytics")
        raise HTTPException(status_code=502, detail="Unable to retrieve analytics data.") from exc

    statuses = [p["status"] for p in petitions]
    resolved = sum(status.lower() == "resolved" for status in statuses)
    rejected = sum(status.lower() == "rejected" for status in statuses)
    total = len(petitions)
    return AnalyticsResponse(
        total=total,
        resolved=resolved,
        rejected=rejected,
        open=total - resolved - rejected,
        resolution_rate=round((resolved / total) * 100) if total else 0,
        by_department=_count_items([p["analysis"]["department_code"] if p["analysis"] else None for p in petitions]),
        by_priority=_count_items([p["analysis"]["priority"] if p["analysis"] else None for p in petitions]),
        by_status=_count_items(statuses),
    )
