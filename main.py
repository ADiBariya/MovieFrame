import os
import sys
import json
import random
import logging
import time
import requests
import tweepy
from bs4 import BeautifulSoup
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

# ─── Load .env FIRST (before os.getenv calls) ─────────────────────────────────
load_dotenv()

# ─── Logging Setup (Unicode-safe for Windows) ─────────────────────────────────
Path("logs").mkdir(exist_ok=True)

# Windows cmd/powershell uses cp1252 which breaks emojis — force utf-8
_stdout_handler = logging.StreamHandler(
    open(sys.stdout.fileno(), mode="w", encoding="utf-8", buffering=1)
)
_formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")
_stdout_handler.setFormatter(_formatter)

_file_handler = logging.FileHandler("logs/bot.log", encoding="utf-8")
_file_handler.setFormatter(_formatter)

logging.basicConfig(level=logging.INFO, handlers=[_stdout_handler, _file_handler])
logger = logging.getLogger(__name__)

# ─── Config ───────────────────────────────────────────────────────────────────
FILMGRAB_BASE   = "https://film-grab.com"
POSTED_DB       = "posted_frames.json"
TEMP_IMAGE      = "temp_frame.jpg"

TWITTER_API_KEY       = os.getenv("TWITTER_API_KEY")
TWITTER_API_SECRET    = os.getenv("TWITTER_API_SECRET")
TWITTER_ACCESS_TOKEN  = os.getenv("TWITTER_ACCESS_TOKEN")
TWITTER_ACCESS_SECRET = os.getenv("TWITTER_ACCESS_SECRET")
TWITTER_BEARER_TOKEN  = os.getenv("TWITTER_BEARER_TOKEN")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

# ─── Helpers ──────────────────────────────────────────────────────────────────

def load_posted() -> dict:
    if Path(POSTED_DB).exists():
        with open(POSTED_DB, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_posted(db: dict):
    with open(POSTED_DB, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2, ensure_ascii=False)


def get_soup(url: str, retries: int = 3):
    """Fetch URL with polite delay + 429 retry backoff."""
    for attempt in range(1, retries + 1):
        try:
            time.sleep(random.uniform(2.0, 4.0))
            resp = requests.get(url, headers=HEADERS, timeout=15)

            if resp.status_code == 429:
                wait = 15 * attempt
                logger.warning(f"Rate limited on {url} — waiting {wait}s (attempt {attempt}/{retries})")
                time.sleep(wait)
                continue

            resp.raise_for_status()
            return BeautifulSoup(resp.text, "html.parser")

        except requests.HTTPError as e:
            logger.error(f"HTTP error {url}: {e}")
            return None
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            if attempt < retries:
                time.sleep(5)
    return None


# ─── Scraper ──────────────────────────────────────────────────────────────────

def get_movie_posts(page: int = 1) -> list:
    url = f"{FILMGRAB_BASE}/page/{page}/" if page > 1 else FILMGRAB_BASE
    soup = get_soup(url)
    if not soup:
        return []

    posts = []
    for article in soup.select("article, .post"):
        link_tag = article.find("a", href=True)
        title_tag = article.find(["h2", "h1", "h3"])
        if link_tag and title_tag:
            posts.append({"title": title_tag.get_text(strip=True), "url": link_tag["href"]})

    if not posts:
        for a in soup.select("a[href*='film-grab.com/20']"):
            title_el = a.find(["h2", "h1", "h3"])
            if title_el:
                posts.append({"title": title_el.get_text(strip=True), "url": a["href"]})

    seen, unique = set(), []
    for p in posts:
        if p["url"] not in seen:
            seen.add(p["url"])
            unique.append(p)

    logger.info(f"Page {page}: found {len(unique)} movies")
    return unique


def get_frames_from_movie(movie_url: str) -> list:
    soup = get_soup(movie_url)
    if not soup:
        return []

    frames = []

    # Prefer lightbox anchor hrefs (full res)
    for a in soup.select("a[href*='wp-content/uploads']"):
        href = a["href"]
        if href.lower().endswith((".jpg", ".jpeg", ".png")) and href not in frames:
            frames.append(href)

    # Fallback: img tags (skip thumbnails)
    if not frames:
        for img in soup.select("img[src*='wp-content/uploads']"):
            src = img.get("src") or img.get("data-src") or ""
            if (src and src.lower().endswith((".jpg", ".jpeg", ".png"))
                    and "-150x" not in src and "-300x" not in src and "-768x" not in src
                    and src not in frames):
                frames.append(src)

    logger.info(f"  Found {len(frames)} frames for: {movie_url}")
    return frames


def pick_unposted_frame(movie: dict, frames: list, posted_db: dict):
    already = set(posted_db.get(movie["url"], []))
    available = [f for f in frames if f not in already]
    return random.choice(available) if available else None


def download_image(image_url: str, dest: str = TEMP_IMAGE) -> bool:
    try:
        resp = requests.get(image_url, headers=HEADERS, timeout=20, stream=True)
        resp.raise_for_status()
        with open(dest, "wb") as f:
            for chunk in resp.iter_content(8192):
                f.write(chunk)
        logger.info(f"  Downloaded image to: {dest}")
        return True
    except Exception as e:
        logger.error(f"Failed to download {image_url}: {e}")
        return False


# ─── Twitter ──────────────────────────────────────────────────────────────────

def validate_twitter_env():
    missing = [k for k in [
        "TWITTER_API_KEY", "TWITTER_API_SECRET",
        "TWITTER_ACCESS_TOKEN", "TWITTER_ACCESS_SECRET",
        "TWITTER_BEARER_TOKEN",
    ] if not os.getenv(k)]
    if missing:
        raise EnvironmentError(
            f"Missing Twitter env vars: {', '.join(missing)}\n"
            "Check your .env file is in the same folder as main.py "
            "and contains all 5 Twitter keys."
        )


def get_twitter_client():
    client = tweepy.Client(
        bearer_token=TWITTER_BEARER_TOKEN,
        consumer_key=TWITTER_API_KEY,
        consumer_secret=TWITTER_API_SECRET,
        access_token=TWITTER_ACCESS_TOKEN,
        access_token_secret=TWITTER_ACCESS_SECRET,
        wait_on_rate_limit=True,
    )
    auth = tweepy.OAuth1UserHandler(
        TWITTER_API_KEY, TWITTER_API_SECRET,
        TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET,
    )
    api_v1 = tweepy.API(auth, wait_on_rate_limit=True)
    return client, api_v1


def build_tweet_text(movie: dict) -> str:
    title = movie["title"]
    tweet = f"{title}\n\n#FilmGrab #CinematicFrames #MovieStills"
    return tweet[:280]


def post_to_twitter(movie: dict, image_path: str) -> bool:
    try:
        client, api_v1 = get_twitter_client()
        logger.info("  Uploading media to Twitter...")
        media = api_v1.media_upload(filename=image_path)
        response = client.create_tweet(
            text=build_tweet_text(movie),
            media_ids=[media.media_id]
        )
        logger.info(f"  Tweet posted! ID: {response.data['id']}")
        return True
    except tweepy.TweepyException as e:
        logger.error(f"Twitter API error: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error posting tweet: {e}")
        return False


# ─── Main Orchestrator ────────────────────────────────────────────────────────

def run():
    logger.info("=" * 60)
    logger.info("Film-Grab Twitter Bot -- Starting run")
    logger.info(f"Time: {datetime.now().isoformat()}")
    logger.info("=" * 60)

    try:
        validate_twitter_env()
    except EnvironmentError as e:
        logger.error(str(e))
        return

    posted_db = load_posted()
    posted_count = sum(len(v) for v in posted_db.values())
    logger.info(f"DB: {len(posted_db)} movies tracked, {posted_count} frames posted so far")

    for page in range(1, 10):
        movies = get_movie_posts(page=page)
        if not movies:
            logger.warning(f"No movies on page {page}, stopping.")
            break

        random.shuffle(movies)

        for movie in movies:
            frames = get_frames_from_movie(movie["url"])
            if not frames:
                continue

            frame_url = pick_unposted_frame(movie, frames, posted_db)
            if not frame_url:
                logger.info(f"  All frames used for: {movie['title']}, skipping.")
                continue

            logger.info(f"  Movie: {movie['title']}")
            logger.info(f"  Frame: {frame_url}")

            if not download_image(frame_url, TEMP_IMAGE):
                continue

            success = post_to_twitter(movie, TEMP_IMAGE)
            Path(TEMP_IMAGE).unlink(missing_ok=True)

            if success:
                posted_db.setdefault(movie["url"], []).append(frame_url)
                save_posted(posted_db)
                logger.info("Done! DB updated.")
                return
            else:
                logger.warning("Tweet failed -- will retry on next run.")
                return

    logger.warning("No unposted frames found across all checked pages.")


if __name__ == "__main__":
    run()