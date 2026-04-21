# ============================================================
#  bot.py — Main bot logic — saare modules ko jodta hai
# ============================================================

import logging
import os
import random
import time
from datetime import datetime

from trends_fetcher import get_trending_topics, get_realtime_trending
from reddit_fetcher import fetch_viral_meme_image
from nvidia_client import generate_meme_caption
from meme_builder import build_meme
from twitter_poster import post_meme_tweet, post_text_tweet, verify_credentials
from config import OUTPUT_DIR, LOG_DIR

# ── Logging Setup ────────────────────────────────────────────
os.makedirs(LOG_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    handlers=[
        logging.FileHandler(os.path.join(LOG_DIR, "bot.log"), encoding="utf-8"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("MemeBot")

# ── Posted tracker (ek hi post baar-baar na jaaye) ──────────
_posted_topics_cache: set[str] = set()
_run_count: int = 0


def run_once() -> bool:
    """
    Ek complete cycle chalao:
    1. Trending topic fetch karo
    2. Reddit se viral meme image lo
    3. NVIDIA se caption banao
    4. Image pe text overlay karo
    5. Twitter pe post karo
    """
    global _run_count
    _run_count += 1

    logger.info("=" * 60)
    logger.info(f"🤖 Bot cycle #{_run_count} start — {datetime.now().strftime('%d %b %Y, %I:%M %p')}")
    logger.info("=" * 60)

    # ── Step 1: Trending topic ────────────────────────────────
    logger.info("📈 Step 1: Google Trends se topic fetch ho raha hai...")
    try:
        # Real-time + daily trends mix karo
        rt_topics = get_realtime_trending(count=3)
        daily_topics = get_trending_topics(count=3)
        all_topics = rt_topics + daily_topics

        # Already posted topics hata do
        fresh = [t for t in all_topics if t not in _posted_topics_cache]
        if not fresh:
            logger.warning("Saare trending topics already post ho chuke — cache reset ho raha hai")
            _posted_topics_cache.clear()
            fresh = all_topics

        topic = random.choice(fresh)
        logger.info(f"✅ Topic selected: '{topic}'")

    except Exception as e:
        logger.error(f"Trends fetch fail: {e}")
        topic = "Monday Mood"

    # ── Step 2: Reddit se viral meme image ───────────────────
    logger.info(f"🖼️  Step 2: Reddit se meme image fetch ho rahi hai (topic: {topic})...")
    image_path = fetch_viral_meme_image(topic_hint=topic)

    if not image_path or not os.path.exists(image_path):
        logger.warning("Reddit image nahi mila — fallback blank image use ho raha hai")
        image_path = None  # meme_builder blank banayega

    # ── Step 3: NVIDIA se caption generate karo ──────────────
    logger.info(f"🤖 Step 3: NVIDIA se caption generate ho raha hai...")
    caption_data = generate_meme_caption(topic)

    top_text    = caption_data.get("top_text", "WHEN YOU SEE IT")
    bottom_text = caption_data.get("bottom_text", "💀")
    tweet_text  = caption_data.get("tweet_text", f"That {topic} feeling 😂 #Memes #Trending")

    logger.info(f"Caption TOP: {top_text}")
    logger.info(f"Caption BOTTOM: {bottom_text}")
    logger.info(f"Tweet: {tweet_text}")

    # ── Step 4: Meme image banao ──────────────────────────────
    logger.info("🎨 Step 4: Meme image build ho raha hai...")

    if image_path:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_name = f"meme_{timestamp}.jpg"
        final_image = build_meme(image_path, top_text, bottom_text, output_name)
    else:
        # Bina image ke sirf tweet text post karenge
        logger.warning("Image nahi mila — sirf text tweet jayega")
        final_image = None

    # ── Step 5: Twitter pe post karo ─────────────────────────
    logger.info("🐦 Step 5: Twitter pe post ho raha hai...")

    if final_image and os.path.exists(final_image):
        success = post_meme_tweet(final_image, tweet_text)
    else:
        success = post_text_tweet(tweet_text)

    # ── Cleanup ───────────────────────────────────────────────
    if success:
        _posted_topics_cache.add(topic)
        logger.info(f"🎉 Cycle #{_run_count} complete! Topic '{topic}' ka meme post ho gaya!")

        # Old files cleanup (sirf 10 se zyada ho toh)
        _cleanup_old_memes()
    else:
        logger.error(f"❌ Cycle #{_run_count} fail — tweet post nahi hua")

    return success


def _cleanup_old_memes():
    """Purani meme files delete karo (disk space bachao)"""
    try:
        files = sorted(
            [os.path.join(OUTPUT_DIR, f) for f in os.listdir(OUTPUT_DIR) if f.startswith("meme_")],
            key=os.path.getctime
        )
        while len(files) > 10:
            os.remove(files.pop(0))
    except Exception as e:
        logger.warning(f"Cleanup error: {e}")


def health_check() -> dict:
    """Bot ka health status check karo"""
    status = {
        "twitter_auth": False,
        "nvidia_api": False,
        "trends_api": False,
        "reddit_api": False,
    }

    try:
        status["twitter_auth"] = verify_credentials()
    except Exception:
        pass

    try:
        from nvidia_client import client
        client.models.list()
        status["nvidia_api"] = True
    except Exception:
        pass

    try:
        topics = get_trending_topics(count=1)
        status["trends_api"] = len(topics) > 0
    except Exception:
        pass

    try:
        import praw  # noqa
        status["reddit_api"] = True
    except ImportError:
        status["reddit_api"] = False

    return status
