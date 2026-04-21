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
from webdriver_manager.chrome import ChromeDriverManager

from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains


from PIL import Image
from io import BytesIO

load_dotenv()
logger = logging.getLogger(__name__)

COOKIE_FILE = "twitter_cookies.json"
PROXY = os.getenv("PROXY")


# ───────── DRIVER ─────────
def _get_driver():
    options = webdriver.ChromeOptions()

    # 🔥 REQUIRED FOR RAILWAY
    options.binary_location = "/usr/bin/chromium"

    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")

    # optional
    options.add_argument("--disable-notifications")

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
            "Accept": "image/*,*/*;q=0.8"
        }

        r = requests.get(url, headers=headers, timeout=20)

        if r.status_code != 200:
            logger.error(f"❌ Bad status: {r.status_code}")
            return False

        if "image" not in r.headers.get("Content-Type", ""):
            logger.error(f"❌ Not an image: {r.headers.get('Content-Type')}")
            return False

        img = Image.open(BytesIO(r.content))
        img = img.convert("RGB")
        img.thumbnail((1280, 1280))
        img.save(path, "JPEG", quality=95)

        if os.path.getsize(path) < 5000:
            logger.error("❌ Image too small after save")
            return False

        logger.info("✅ Image downloaded + fixed")
        return True

    except Exception as e:
        logger.error(f"Download error: {e}")
        return False


# cookiesssss
def load_cookies(driver):
    driver.get("https://twitter.com")

    if not os.path.exists(COOKIE_FILE):
        logger.error("❌ twitter_cookies.json not found")
        return False

    with open(COOKIE_FILE, "r", encoding="utf-8") as f:
        cookies = json.load(f)

    for cookie in cookies:
        try:
            cookie.pop("sameSite", None)

            # 🔥 FIX: domain issue
            if "domain" in cookie:
                cookie["domain"] = ".twitter.com"

            driver.add_cookie(cookie)
        except:
            pass

    driver.refresh()
    time.sleep(5)

    logger.info("✅ Cookies loaded")

    # 🔥 NEW: LOGIN CHECK (CRITICAL)
    driver.get("https://twitter.com/home")
    time.sleep(5)

    if "login" in driver.current_url.lower():
        logger.error("❌ Cookies invalid — not logged in")
        return False
    else:
        logger.info("✅ Logged in successfully")

    return True
    
def post_meme_tweet(image_path: str, tweet_text: str) -> bool:
    try:
        driver = _get_driver()
        wait = WebDriverWait(driver, 35)

        if not load_cookies(driver):
            return False

        driver.get("https://twitter.com/compose/post")
        time.sleep(5)

        tweet_box = wait.until(
            EC.presence_of_element_located((By.XPATH, "//div[@data-testid='tweetTextarea_0']"))
        )

        human_type(tweet_box, tweet_text)
        time.sleep(random.uniform(2, 3))

        image_path = os.path.abspath(image_path)

        if not os.path.exists(image_path):
            logger.error("❌ Image not found")
            return False

        logger.info(f"Uploading image: {image_path}")

        upload = wait.until(
            EC.presence_of_element_located((By.XPATH, "//input[@type='file']"))
        )

        driver.execute_script("""
        arguments[0].style.display = 'block';
        arguments[0].style.visibility = 'visible';
        arguments[0].style.opacity = 1;
        """, upload)

        time.sleep(1)

        upload.send_keys(image_path)
        logger.info("📤 Image uploaded")

        time.sleep(8)

        # 🔥 SPACE FIX (popup close)
        logger.info("🔥 Closing hashtag popup via SPACE")
        tweet_box.send_keys(" ")
        time.sleep(1)

        # 🔥 SAFE BUTTON FIND (NO CRASH)
        try:
            tweet_btn = driver.find_element(By.XPATH, "//div[@data-testid='tweetButtonInline']")
        except:
            logger.warning("⚠️ Tweet button not found → CTRL+ENTER fallback")
            tweet_box.send_keys(Keys.CONTROL, Keys.ENTER)
            time.sleep(5)
            driver.quit()
            return True

        driver.execute_script("arguments[0].scrollIntoView(true);", tweet_btn)
        time.sleep(2)

        clicked = False

        try:
            tweet_btn.click()
            clicked = True
        except:
            pass

        if not clicked:
            try:
                driver.execute_script("arguments[0].click();", tweet_btn)
                clicked = True
            except:
                pass

        if not clicked:
            logger.warning("⚠️ Button failed → CTRL+ENTER fallback")
            tweet_box.send_keys(Keys.CONTROL, Keys.ENTER)

        logger.info("🚀 Submit attempted")

        time.sleep(6)

        try:
            if "compose" not in driver.current_url:
                logger.info("✅ Tweet posted")
                driver.quit()
                return True
        except:
            pass

        driver.quit()
        return True

    except Exception as e:
        logger.error(f"Selenium error: {e}")
        return False
