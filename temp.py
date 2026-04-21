import pickle
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
driver.get("https://twitter.com/login")

print("👉 Login manually in browser...")
time.sleep(60)  # tu login kar le (increase if needed)

cookies = driver.get_cookies()

with open("twitter_cookies.pkl", "wb") as f:
    pickle.dump(cookies, f)

print("✅ Cookies saved!")

driver.quit()