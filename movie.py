import logging
import random
import requests
from bs4 import BeautifulSoup
from dataclasses import dataclass
from config import FILMGRAB_BASE_URL, FILMGRAB_RANDOM_URL, REQUEST_HEADERS, REQUEST_TIMEOUT

logger = logging.getLogger(__name__)


@dataclass
class FilmFrame:
    movie_name: str
    year: str
    director: str
    image_url: str
    post_url: str


def get_random_film_frame() -> FilmFrame | None:
    post_url = _follow_random_redirect()
    if not post_url:
        return None
    return _scrape_film_post(post_url)


def get_latest_film_frames(count: int = 10) -> list[FilmFrame]:
    frames = []
    try:
        resp = requests.get(FILMGRAB_BASE_URL, headers=REQUEST_HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        post_links = []
        for h2 in soup.select("h2 a[href]"):
            href = h2["href"]
            if href.startswith(FILMGRAB_BASE_URL) and href != FILMGRAB_BASE_URL:
                post_links.append(href)

        post_links = list(dict.fromkeys(post_links))[:count]
        logger.info(f"Homepage se {len(post_links)} posts mile")

        for link in post_links:
            frame = _scrape_film_post(link)
            if frame:
                frames.append(frame)

    except Exception as e:
        logger.error(f"Homepage scrape fail: {e}")

    return frames


def _follow_random_redirect() -> str | None:
    try:
        resp = requests.get(
            FILMGRAB_RANDOM_URL,
            headers=REQUEST_HEADERS,
            timeout=REQUEST_TIMEOUT,
            allow_redirects=True
        )
        final_url = resp.url
        if final_url and final_url != FILMGRAB_BASE_URL:
            logger.info(f"Random redirect: {final_url}")
            return final_url
    except Exception as e:
        logger.error(f"Random redirect fail: {e}")
    return None


def _scrape_film_post(post_url: str) -> FilmFrame | None:
    try:
        resp = requests.get(post_url, headers=REQUEST_HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        movie_name = _extract_title(soup)
        year       = _extract_meta(soup, "Year")
        director   = _extract_meta(soup, "Director")
        image_url  = _extract_random_image(soup)

        if not movie_name or not image_url:
            logger.warning(f"Incomplete data at {post_url}")
            return None

        logger.info(f"Scraped: {movie_name} ({year}) — {image_url}")
        return FilmFrame(
            movie_name=movie_name,
            year=year,
            director=director,
            image_url=image_url,
            post_url=post_url,
        )

    except Exception as e:
        logger.error(f"Post scrape fail ({post_url}): {e}")
        return None


def _extract_title(soup: BeautifulSoup) -> str:
    h1 = soup.find("h1")
    if h1:
        return h1.get_text(strip=True)
    title_tag = soup.find("title")
    if title_tag:
        return title_tag.get_text(strip=True).split("–")[0].strip()
    return ""


def _extract_meta(soup: BeautifulSoup, label: str) -> str:
    for p in soup.find_all("p"):
        text = p.get_text()
        if label + ":" in text:
            parts = text.split(label + ":")
            if len(parts) > 1:
                return parts[1].strip().split("\n")[0].strip()
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if f"/{label.lower()}/" in href.lower():
            return a.get_text(strip=True)
    return ""


def _extract_random_image(soup: BeautifulSoup) -> str:
    gallery_imgs = soup.select("a[href*='photo-gallery'] img, a[href*='.jpg'] img")
    full_urls = []

    for img in gallery_imgs:
        parent_a = img.find_parent("a")
        if parent_a and parent_a.get("href", "").endswith(".jpg"):
            full_urls.append(parent_a["href"])

    if not full_urls:
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if "photo-gallery" in href and href.endswith(".jpg") and "thumb" not in href:
                full_urls.append(href)

    if full_urls:
        return random.choice(full_urls)

    for img in soup.find_all("img", src=True):
        src = img["src"]
        if "wp-content/uploads" in src and "thumb" not in src and src.endswith(".jpg"):
            return src

    return ""