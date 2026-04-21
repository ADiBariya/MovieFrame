import os
import time
import random
import logging
import json
import subprocess
import requests
from dotenv import load_dotenv

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service

from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException

from PIL import Image
from io import BytesIO

load_dotenv()
logger = logging.getLogger(__name__)

COOKIE_FILE = "twitter_cookies.json"
PROXY = os.getenv("PROXY")
DEFAULT_WAIT_TIMEOUT = 60

COMPOSE_URLS = [
    "https://x.com/compose/post"
]


# ───────── DRIVER ─────────
def _get_driver():
    options = webdriver.ChromeOptions()

    options.binary_location = "/usr/bin/chromium"

    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-background-networking")
    options.add_argument("--disable-sync")
    options.add_argument("--metrics-recording-only")
    options.add_argument("--disable-default-apps")
    options.add_argument("--no-first-run")
    options.add_argument("--disable-features=Translate,BackForwardCache")
    options.add_argument("--disable-background-timer-throttling")
    options.add_argument("--disable-renderer-backgrounding")
    options.add_argument("--disable-device-discovery-notifications")

    if PROXY:
        options.add_argument(f'--proxy-server={PROXY}')

    return webdriver.Chrome(
        service=Service("/usr/bin/chromedriver"),
        options=options
    )


# ───────── HUMAN TYPE ─────────
def human_type(el, text):
    for c in text:
        el.send_keys(c)
        time.sleep(random.uniform(0.03, 0.1))


# ───────── DOWNLOAD + FIX IMAGE ─────────
def download_image(url, path):
    try:
        headers = {
            "User-Agent": "Mozilla/5.0",
            "Referer": "https://film-grab.com/",
        }

        r = requests.get(url, headers=headers, timeout=20)

        img = Image.open(BytesIO(r.content))
        img = img.convert("RGB")
        img.thumbnail((1280, 1280))
        img.save(path, "JPEG", quality=95)

        logger.info("✅ Image downloaded + fixed")
        return True

    except Exception as e:
        logger.error(f"Download error: {e}")
        return False


# ───────── COOKIES (FIXED) ─────────
def load_cookies(driver):
    driver.get("https://x.com")
    time.sleep(3)

    if not os.path.exists(COOKIE_FILE):
        logger.error("❌ twitter_cookies.json not found")
        return False

    with open(COOKIE_FILE, "r", encoding="utf-8") as f:
        cookies = json.load(f)

    for cookie in cookies:
        try:
            cookie.pop("sameSite", None)

            # 🔥 IMPORTANT FIX
            cookie["domain"] = ".x.com"
            cookie["secure"] = True

            driver.add_cookie(cookie)
        except:
            pass

    driver.refresh()
    time.sleep(5)

    logger.info("✅ Cookies loaded")

    # 🔥 LOGIN CHECK
    driver.get("https://x.com/home")
    time.sleep(5)

    if "login" in driver.current_url.lower():
        logger.error("❌ Cookies invalid — redirected to login")
        return False

    logger.info("✅ Logged in successfully")
    return True


# ───────── COMPOSE FIX ─────────
def _open_compose_and_get_tweet_box(driver, wait):
    driver.get("https://x.com/home")
    time.sleep(5)

    # 🔥 open compose via button (stable)
    compose_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//a[@data-testid='SideNav_NewTweet_Button']"))
    )

    driver.execute_script("arguments[0].click();", compose_btn)
    time.sleep(5)

    driver.find_element(By.TAG_NAME, "body").click()
    time.sleep(1)

    tweet_box = wait.until(
        EC.presence_of_element_located((By.XPATH, "//div[@role='textbox']"))
    )

    logger.info("✅ Compose editor found")
    return tweet_box


# ───────── MAIN POST ─────────
def post_meme_tweet(image_path: str, tweet_text: str) -> bool:
    driver = None
    try:
        driver = _get_driver()
        wait = WebDriverWait(driver, DEFAULT_WAIT_TIMEOUT)

        if not load_cookies(driver):
            return False

        tweet_box = _open_compose_and_get_tweet_box(driver, wait)

        human_type(tweet_box, tweet_text)
        time.sleep(2)

        image_path = os.path.abspath(image_path)

        if not os.path.exists(image_path):
            logger.error("❌ Image not found")
            return False

        upload = wait.until(
            EC.presence_of_element_located((By.XPATH, "//input[@type='file']"))
        )

        driver.execute_script("""
        arguments[0].style.display='block';
        arguments[0].style.visibility='visible';
        """, upload)

        upload.send_keys(image_path)
        logger.info("📤 Image uploaded")

        time.sleep(6)

        # 🔥 close popup
        tweet_box.send_keys(" ")
        time.sleep(1)

        # 🔥 click tweet
        clicked = False

        for _ in range(3):
            try:
                tweet_btn = wait.until(
                    EC.element_to_be_clickable((By.XPATH, "//div[@data-testid='tweetButtonInline']"))
                )

                driver.execute_script("arguments[0].click();", tweet_btn)
                clicked = True
                logger.info("🚀 Tweet clicked")
                break
            except:
                time.sleep(2)

        if not clicked:
            tweet_box.send_keys(Keys.CONTROL, Keys.ENTER)

        time.sleep(8)

        logger.info("✅ Tweet posted")

        driver.quit()
        return True

    except Exception as e:
        logger.error(f"Selenium error: {e}")
        if driver:
            driver.quit()
        return False
