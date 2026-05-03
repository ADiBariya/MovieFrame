import asyncio
import sys
import os
from datetime import datetime, timezone
from typing import Annotated

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from database import get_db
from deps import get_current_user
from models import AutomationConfig, AutomationRunOut

router = APIRouter(prefix="/automations", tags=["automations"])

AUTOMATION_TYPES = [
    {
        "id": "post_movie_frame",
        "name": "Post Movie Frame",
        "description": "Scrapes a cinematic frame from film-grab.com and posts it to your connected platform.",
        "icon": "Film",
    }
]


def _serialize_run(doc: dict) -> AutomationRunOut:
    return AutomationRunOut(
        id=str(doc["_id"]),
        automation_type=doc.get("automation_type", "post_movie_frame"),
        status=doc.get("status", "queued"),
        started_at=doc.get("started_at"),
        finished_at=doc.get("finished_at"),
        logs=doc.get("logs", []),
        movie_title=doc.get("movie_title"),
        frame_url=doc.get("frame_url"),
        tweet_url=doc.get("tweet_url"),
        user_id=doc.get("user_id", ""),
        config=doc.get("config"),
    )


@router.get("")
async def list_automation_types():
    return {"automations": AUTOMATION_TYPES}


@router.post("/run", response_model=AutomationRunOut)
async def trigger_run(
    config: AutomationConfig,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    db = get_db()
    run_id = str(ObjectId())
    now = datetime.now(timezone.utc)

    run_doc = {
        "_id": run_id,
        "automation_type": "post_movie_frame",
        "status": "queued",
        "started_at": now,
        "finished_at": None,
        "logs": [f"[{now.isoformat()}] Run queued"],
        "movie_title": None,
        "frame_url": None,
        "tweet_url": None,
        "user_id": str(current_user["_id"]),
        "config": config.model_dump(),
    }
    await db.automation_runs.insert_one(run_doc)

    # Fire-and-forget background execution
    asyncio.create_task(_execute_run(run_id, config, current_user))

    return _serialize_run(run_doc)


async def _execute_run(run_id: str, config: AutomationConfig, user: dict):
    db = get_db()

    async def log(msg: str):
        ts = datetime.now(timezone.utc).isoformat()
        await db.automation_runs.update_one(
            {"_id": run_id},
            {"$push": {"logs": f"[{ts}] {msg}"}, "$set": {"status": "running"}},
        )

    try:
        await log("Starting automation…")
        await db.automation_runs.update_one(
            {"_id": run_id}, {"$set": {"status": "running"}}
        )

        # Run the existing bot logic in a thread pool to avoid blocking
        loop = asyncio.get_event_loop()

        # Add project root to sys.path so we can import main
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

        def _run_bot():
            if project_root not in sys.path:
                sys.path.insert(0, project_root)
            import importlib
            import importlib.util
            spec = importlib.util.spec_from_file_location(
                "bot_main", os.path.join(project_root, "main.py")
            )
            if spec and spec.loader:
                mod = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(mod)  # type: ignore[union-attr]
                mod.run()  # type: ignore[attr-defined]

        await loop.run_in_executor(None, _run_bot)
        await log("Automation completed successfully")

        await db.automation_runs.update_one(
            {"_id": run_id},
            {"$set": {"status": "succeeded", "finished_at": datetime.now(timezone.utc)}},
        )
    except Exception as exc:
        ts = datetime.now(timezone.utc).isoformat()
        await db.automation_runs.update_one(
            {"_id": run_id},
            {
                "$push": {"logs": f"[{ts}] ERROR: {exc}"},
                "$set": {
                    "status": "failed",
                    "finished_at": datetime.now(timezone.utc),
                },
            },
        )


@router.get("/runs", response_model=list[AutomationRunOut])
async def list_runs(current_user: Annotated[dict, Depends(get_current_user)]):
    db = get_db()
    cursor = db.automation_runs.find(
        {"user_id": str(current_user["_id"])}
    ).sort("started_at", -1).limit(50)
    docs = await cursor.to_list(50)
    return [_serialize_run(d) for d in docs]


@router.get("/runs/{run_id}", response_model=AutomationRunOut)
async def get_run(
    run_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    db = get_db()
    doc = await db.automation_runs.find_one(
        {"_id": run_id, "user_id": str(current_user["_id"])}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Run not found")
    return _serialize_run(doc)
