import os
import time
import random
import logging
import json
import requests
from dotenv import load_dotenv

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service

from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

from PIL import Image
from io import BytesIO

load_dotenv()
logger = logging.getLogger(__name__)

COOKIE_FILE = "twitter_cookies.json"
PROXY = os.getenv("PROXY")
DEFAULT_WAIT_TIMEOUT = 60


# ───────── DRIVER ─────────
def _get_driver():
    options = webdriver.ChromeOptions()
    options.binary_location = "/usr/bin/chromium"

    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")

    # 🔥 CRASH FIX
    options.add_argument("--renderer-process-limit=1")
    options.add_argument("--single-process")
    options.add_argument("--js-flags=--max-old-space-size=128")

    # 🔥 LIGHT MODE
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-background-networking")
    options.add_argument("--disable-sync")

    # 🔥 IMPORTANT → images OFF (memory बचाने के लिए)
    options.add_argument("--blink-settings=imagesEnabled=false")

    options.add_argument("--window-size=800,600")

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


# ───────── DOWNLOAD IMAGE ─────────
def download_image(url, path):
    try:
        r = requests.get(url, timeout=20)
        img = Image.open(BytesIO(r.content)).convert("RGB")
        img.save(path, "JPEG", quality=95)
        logger.info("✅ Image downloaded + fixed")
        return True
    except Exception as e:
        logger.error(f"Download error: {e}")
        return False


# ───────── LOAD COOKIES ─────────
def load_cookies(driver):
    driver.get("https://x.com")
    time.sleep(3)

    if not os.path.exists(COOKIE_FILE):
        logger.error("❌ cookies missing")
        return False

    with open(COOKIE_FILE, "r") as f:
        cookies = json.load(f)

    for cookie in cookies:
        try:
            cookie["domain"] = ".x.com"
            driver.add_cookie(cookie)
        except:
            pass

    driver.refresh()
    time.sleep(5)

    if "login" in driver.current_url:
        logger.error("❌ cookies expired")
        return False

    logger.info("✅ Logged in successfully")
    return True


# ───────── MAIN POST ─────────
def post_meme_tweet(image_path, tweet_text):
    driver = None
    try:
        driver = _get_driver()
        wait = WebDriverWait(driver, DEFAULT_WAIT_TIMEOUT)

        if not load_cookies(driver):
            return False

        # open compose
        driver.get("https://x.com/compose/post")
        time.sleep(5)

        tweet_box = wait.until(
            EC.presence_of_element_located((By.XPATH, "//div[@role='textbox']"))
        )

        logger.info("✅ Compose editor found")

        human_type(tweet_box, tweet_text)
        time.sleep(2)

        # upload image
        upload = wait.until(
            EC.presence_of_element_located((By.XPATH, "//input[@type='file']"))
        )

        upload.send_keys(os.path.abspath(image_path))
        logger.info("📤 Image uploading...")

        # 🔥 lightweight wait (NO UI dependency)
        time.sleep(5)

        # close hashtag popup
        tweet_box.send_keys(" ")
        time.sleep(1)

        # post
        try:
            tweet_btn = wait.until(
                EC.element_to_be_clickable((By.XPATH, "//div[@data-testid='tweetButtonInline']"))
            )
            driver.execute_script("arguments[0].click();", tweet_btn)
        except:
            tweet_box.send_keys(Keys.CONTROL, Keys.ENTER)

        time.sleep(6)

        logger.info("✅ Tweet posted")

        driver.quit()
        return True

    except Exception as e:
        logger.error(f"Selenium error: {e}")
        if driver:
            driver.quit()
        return False
