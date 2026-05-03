from datetime import datetime, timezone, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends

from database import get_db
from deps import get_current_user
from models import AnalyticsOverview, HistoryPoint

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview", response_model=AnalyticsOverview)
async def get_overview(current_user: Annotated[dict, Depends(get_current_user)]):
    db = get_db()
    uid = str(current_user["_id"])

    total = await db.automation_runs.count_documents({"user_id": uid})
    succeeded = await db.automation_runs.count_documents({"user_id": uid, "status": "succeeded"})
    failed = await db.automation_runs.count_documents({"user_id": uid, "status": "failed"})

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    posts_today = await db.automation_runs.count_documents(
        {"user_id": uid, "status": "succeeded", "finished_at": {"$gte": today_start}}
    )

    platforms_count = await db.platforms.count_documents({"user_id": uid, "connected": True})

    success_rate = round((succeeded / total * 100) if total > 0 else 0.0, 1)
    # Rough estimate: 30 min of manual work per post
    time_saved = round(succeeded * 0.5, 1)

    return AnalyticsOverview(
        total_runs=total,
        successful_runs=succeeded,
        failed_runs=failed,
        success_rate=success_rate,
        posts_today=posts_today,
        connected_platforms=platforms_count,
        time_saved_hours=time_saved,
    )


@router.get("/history", response_model=list[HistoryPoint])
async def get_history(
    days: int = 30,
    current_user: Annotated[dict, Depends(get_current_user)] = None,
):
    db = get_db()
    uid = str(current_user["_id"])
    since = datetime.now(timezone.utc) - timedelta(days=days)

    pipeline = [
        {
            "$match": {
                "user_id": uid,
                "started_at": {"$gte": since},
            }
        },
        {
            "$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$started_at"}
                },
                "posts": {"$sum": {"$cond": [{"$eq": ["$status", "succeeded"]}, 1, 0]}},
                "failures": {"$sum": {"$cond": [{"$eq": ["$status", "failed"]}, 1, 0]}},
            }
        },
        {"$sort": {"_id": 1}},
    ]

    results = await db.automation_runs.aggregate(pipeline).to_list(100)

    # Fill missing days with zeros
    points: dict[str, HistoryPoint] = {}
    for r in results:
        points[r["_id"]] = HistoryPoint(
            date=r["_id"], posts=r["posts"], failures=r["failures"]
        )

    output = []
    for i in range(days):
        day = (since + timedelta(days=i + 1)).strftime("%Y-%m-%d")
        output.append(points.get(day, HistoryPoint(date=day, posts=0, failures=0)))

    return output
