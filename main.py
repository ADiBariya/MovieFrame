# ============================================================
#  main.py — Bot ka entry point (yahi run karo)
# ============================================================

import logging
import time
import sys
import signal
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.interval import IntervalTrigger

from bot import run_once, health_check
from config import POST_INTERVAL_HOURS

logger = logging.getLogger("Scheduler")

scheduler = None


def graceful_shutdown(signum, frame):
    """Ctrl+C se bot safely band ho"""
    logger.info("🛑 Shutdown signal mila — bot band ho raha hai...")
    if scheduler and scheduler.running:
        scheduler.shutdown(wait=False)
    sys.exit(0)


def main():
    global scheduler

    # Signals handle karo
    signal.signal(signal.SIGINT,  graceful_shutdown)
    signal.signal(signal.SIGTERM, graceful_shutdown)

    logger.info("=" * 60)
    logger.info("🚀 Twitter Post — Starting Up")
    logger.info(f"⏰ Post interval: har {POST_INTERVAL_HOURS} ghante mein")
    logger.info("=" * 60)

    # ── Health check (startup pe) ─────────────────────────────
    logger.info("🔍 Health check chal raha hai...")
    status = health_check()
    for service, ok in status.items():
        icon = "✅" if ok else "⚠️ "
        logger.info(f"  {icon} {service}: {'OK' if ok else 'FAIL / Not Connected'}")

    if not status["twitter_auth"]:
        logger.error("❌ Twitter auth fail! config.py mein keys check karo. Bot band ho raha hai.")
        sys.exit(1)

    if not status["film_grab_api"]:
        logger.warning("⚠️  Film-Grab API connect nahi hua — fallback images use honge")

    # ── Pehli baar turant chalao ──────────────────────────────
    logger.info("\n▶️  Pehla post turant ho raha hai...\n")
    try:
        run_once()
    except Exception as e:
        logger.error(f"Pehla run fail: {e}")

    # ── Scheduler setup ───────────────────────────────────────
    scheduler = BlockingScheduler(timezone="Asia/Kolkata")
    scheduler.add_job(
        func=run_once,
        trigger=IntervalTrigger(hours=POST_INTERVAL_HOURS),
        id="meme_post_job",
        name="Meme Post",
        misfire_grace_time=300,     # 5 min late chalega toh bhi chalega
        replace_existing=True,
        max_instances=1             # Ek saath do posts nahi
    )

    logger.info(f"\n⏰ Scheduler active — har {POST_INTERVAL_HOURS} ghante mein post hoga")
    logger.info("Bot chal raha hai... (Ctrl+C se band karo)\n")

    try:
        scheduler.start()
    except Exception as e:
        logger.error(f"Scheduler crash: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
