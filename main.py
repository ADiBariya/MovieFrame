import os
import sys
import json
import random
import logging
import time
import requests
from bs4 import BeautifulSoup
from pathlib import Path
from dotenv import load_dotenv
from twitter_poster import post_meme_tweet

from PIL import Image
from io import BytesIO

# ─── Load .env ─────────────────────────────────────────────
load_dotenv()

# ─── Logging Setup ─────────────────────────────────────────
Path("logs").mkdir(exist_ok=True)

_stdout_handler = logging.StreamHandler(sys.stdout)
_formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")
_stdout_handler.setFormatter(_formatter)

_file_handler = logging.FileHandler("logs/bot.log", encoding="utf-8")
_file_handler.setFormatter(_formatter)

logging.basicConfig(level=logging.INFO, handlers=[_stdout_handler, _file_handler])
logger = logging.getLogger(__name__)

# ─── Config ────────────────────────────────────────────────
FILMGRAB_BASE = "https://film-grab.com"
POSTED_DB = "posted_frames.json"
TEMP_IMAGE = "temp_frame.jpg"

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

# ─── Helpers ───────────────────────────────────────────────

def load_posted():
    if Path(POSTED_DB).exists():
        with open(POSTED_DB, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_posted(db):
    with open(POSTED_DB, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2, ensure_ascii=False)

def get_soup(url, retries=3):
    for attempt in range(retries):
        try:
            time.sleep(random.uniform(2, 4))
            resp = requests.get(url, headers=HEADERS, timeout=15)
            resp.raise_for_status()
            return BeautifulSoup(resp.text, "html.parser")
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            time.sleep(5)
    return None

# ─── Scraper ───────────────────────────────────────────────

def get_movie_posts(page=1):
    url = f"{FILMGRAB_BASE}/page/{page}/" if page > 1 else FILMGRAB_BASE
    soup = get_soup(url)
    if not soup:
        return []

    posts = []
    for article in soup.select("article, .post"):
        link = article.find("a", href=True)
        title = article.find(["h2", "h1", "h3"])
        if link and title:
            posts.append({"title": title.text.strip(), "url": link["href"]})

    logger.info(f"Page {page}: {len(posts)} movies")
    return posts

def get_frames_from_movie(movie_url):
    soup = get_soup(movie_url)
    if not soup:
        return []

    frames = []

    for a in soup.select("a[href*='wp-content/uploads']"):
        href = a.get("href", "")
        if href.endswith((".jpg", ".jpeg", ".png")):
            frames.append(href)

    if not frames:
        for img in soup.select("img[src*='wp-content/uploads']"):
            src = img.get("src") or ""
            if src.endswith((".jpg", ".jpeg", ".png")):
                frames.append(src)

    logger.info(f"  Found {len(frames)} frames")
    return list(set(frames))

def pick_unposted_frame(movie, frames, db):
    used = set(db.get(movie["url"], []))
    available = [f for f in frames if f not in used]
    return random.choice(available) if available else None

# ─── 🔥 SAFE DOWNLOAD + FIX ─────────────────────────────────

def download_image(url, path):
    try:
        headers = {
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://film-grab.com/",
            "Accept": "image/*"
        }

        r = requests.get(url, headers=headers, timeout=20)

        if r.status_code != 200:
            return False

        if "image" not in r.headers.get("Content-Type", ""):
            return False

        img = Image.open(BytesIO(r.content))
        img = img.convert("RGB")
        img.thumbnail((1280, 1280))
        img.save(path, "JPEG", quality=95)

        if os.path.getsize(path) < 5000:
            return False

        logger.info("  Image downloaded + fixed")
        return True

    except Exception as e:
        logger.error(f"Download error: {e}")
        return False

# ─── Tweet Text ────────────────────────────────────────────

def build_tweet_text(movie):
    return f"{movie['title']}\n\n#Cinema #MovieFrames #Viral"

# ─── MAIN ─────────────────────────────────────────────────

def run():
    logger.info("=" * 50)
    logger.info("BOT START")
    logger.info("=" * 50)

    db = load_posted()

    for page in range(1, 3):
        movies = get_movie_posts(page)

        for movie in movies:
            frames = get_frames_from_movie(movie["url"])
            if not frames:
                continue

            frame = pick_unposted_frame(movie, frames, db)
            if not frame:
                continue

            logger.info(f"Movie: {movie['title']}")
            logger.info(f"Frame: {frame}")

            # 🔥 RETRY DOWNLOAD
            success_download = False
            for _ in range(3):
                if download_image(frame, TEMP_IMAGE):
                    success_download = True
                    break
                time.sleep(2)

            if not success_download:
                continue

            try:
                success = post_meme_tweet(
                    TEMP_IMAGE,
                    build_tweet_text(movie)
                )
            finally:
                if os.path.exists(TEMP_IMAGE):
                    os.remove(TEMP_IMAGE)

            if success:
                db.setdefault(movie["url"], []).append(frame)
                save_posted(db)
                logger.info("✅ DONE")
                return
            else:
                logger.warning("Retry next run")
                return


if __name__ == "__main__":
    while True:
        try:
            run()
        except Exception as e:
            logger.error(f"Main loop error: {e}")

        logger.info("⏳ Waiting 3 hours for next post...")
        time.sleep(3 * 60 * 60)