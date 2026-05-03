from datetime import datetime, timezone
from typing import Annotated

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from database import get_db
from deps import get_current_user
from models import PlatformConnect, PlatformOut

router = APIRouter(prefix="/platforms", tags=["platforms"])

SUPPORTED_PLATFORMS = ["twitter", "instagram", "reddit"]


def _serialize_platform(doc: dict) -> PlatformOut:
    return PlatformOut(
        id=str(doc["_id"]),
        platform=doc["platform"],
        connected=doc.get("connected", True),
        connected_at=doc.get("connected_at"),
        username=doc.get("username"),
    )


@router.get("", response_model=list[PlatformOut])
async def list_platforms(current_user: Annotated[dict, Depends(get_current_user)]):
    db = get_db()
    docs = await db.platforms.find({"user_id": str(current_user["_id"])}).to_list(20)
    return [_serialize_platform(d) for d in docs]


@router.post("/connect", response_model=PlatformOut, status_code=201)
async def connect_platform(
    payload: PlatformConnect,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    if payload.platform not in SUPPORTED_PLATFORMS:
        raise HTTPException(status_code=400, detail=f"Unsupported platform: {payload.platform}")

    db = get_db()
    # Remove existing connection for same platform
    await db.platforms.delete_many(
        {"user_id": str(current_user["_id"]), "platform": payload.platform}
    )

    doc = {
        "_id": str(ObjectId()),
        "user_id": str(current_user["_id"]),
        "platform": payload.platform,
        "connected": True,
        "connected_at": datetime.now(timezone.utc),
        # Credentials stored — in production encrypt at rest
        "api_key": payload.api_key,
        "api_secret": payload.api_secret,
        "access_token": payload.access_token,
        "access_secret": payload.access_secret,
        "bearer_token": payload.bearer_token,
        "username": None,
    }
    await db.platforms.insert_one(doc)
    return _serialize_platform(doc)


@router.delete("/{platform_id}", status_code=204)
async def disconnect_platform(
    platform_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    db = get_db()
    result = await db.platforms.delete_one(
        {"_id": platform_id, "user_id": str(current_user["_id"])}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Platform not found")


@router.get("/status")
async def platform_status(current_user: Annotated[dict, Depends(get_current_user)]):
    db = get_db()
    docs = await db.platforms.find({"user_id": str(current_user["_id"])}).to_list(20)
    return {
        "connected": [d["platform"] for d in docs if d.get("connected")],
        "total": len(docs),
    }
