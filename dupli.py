import json
import os

FILE = "posted.json"

def load_posted():
    if not os.path.exists(FILE):
        return set()
    with open(FILE, "r") as f:
        return set(json.load(f))

def save_posted(posted):
    with open(FILE, "w") as f:
        json.dump(list(posted), f)

def is_posted(image_url):
    posted = load_posted()
    return image_url in posted

def mark_posted(image_url):
    posted = load_posted()
    posted.add(image_url)
    save_posted(posted)