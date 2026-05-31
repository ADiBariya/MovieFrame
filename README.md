# MovieFrame

[![Python](https://img.shields.io/badge/python-3.9%2B-blue?logo=python)](https://www.python.org/)
[![Last Commit](https://img.shields.io/github/last-commit/ADiBariya/MovieFrame?logo=github)](https://github.com/ADiBariya/MovieFrame/commits/main)
[![Issues](https://img.shields.io/github/issues/ADiBariya/MovieFrame?logo=github)](https://github.com/ADiBariya/MovieFrame/issues)
[![License](https://img.shields.io/github/license/ADiBariya/MovieFrame?logo=github)](LICENSE)
[![Docker Ready](https://img.shields.io/badge/docker-ready-blue?logo=docker)](Dockerfile)

> **MovieFrame** is an automated Twitter bot that discovers cinematic frames from [Film Grab](https://film-grab.com/), avoids duplicates, and posts them to Twitter at regular intervals.

---

## ✨ Features

- Scrapes movie frames, titles, directors, and years from **film-grab.com**
- Downloads, processes, and deduplicates frames using image hashing
- Creates and posts tweets via [Selenium](https://www.selenium.dev/) automation
- Manages posting state with MongoDB and local JSON for history
- Logs all operations; robust to common network and scraping issues
- Docker-ready for simple deployment

---

## 🗂️ Project Structure

```
.
├── main.py              # Main bot orchestration (scraping, posting)
├── movie.py             # Movie frame scraping utility
├── dupli.py             # Deduplication helpers via JSON
├── twitter_poster.py    # Twitter automation (Selenium, MongoDB)
├── requirements.txt     # Python dependencies
├── Dockerfile           # Containerization setup
├── railway.toml         # [Deployment config for Railway]
├── posted.json          # (Generated) Tracks posted frames
├── twitter_cookies.json # (Required) For Twitter session auth
├── .env.example         # ENV config template
└── logs/                # Log files output
```

---

## Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/ADiBariya/MovieFrame.git
cd MovieFrame
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` to set your MongoDB URI and optional proxy.

### 2. Twitter Cookies

- Use Chrome or Firefox to export Twitter cookies as a `.json` file
- Save as `twitter_cookies.json` in the project root

### 3. Run Locally

```bash
python main.py
```

The bot will scrape frames and post every 3 hours. Ensure Chrome/Chromium and ChromeDriver are installed and available in the expected paths for Selenium.

### 4. Docker Deployment

```bash
docker build -t movieframe-bot .
docker run -d --env-file .env -v "$(pwd)/twitter_cookies.json:/app/twitter_cookies.json" movieframe-bot
```

---

## ⚙️ Configuration

Set environment variables in your `.env`:
- `MONGO_URI`: MongoDB connection string
- `PROXY`: (optional) HTTP proxy for network requests

---

## Dependencies

- **Python** >= 3.9
- `requests`, `beautifulsoup4`, `selenium`, `pillow`
- `python-dotenv`, `pymongo`
- Chrome/Chromium + ChromeDriver for Selenium

See `requirements.txt` for full list.

---

##  How it Works

1. **Frame Discovery:** Scrapes posts from film-grab.com, parses movie info and available frames.
2. **Deduplication:** Each frame URL is hashed and checked against the posted database.
3. **Image Processing:** Frame images are downloaded and normalized.
4. **Twitter Automation:** Uses Selenium to log in and post via Twitter's web interface.
5. **Persistence:** Posts are tracked in MongoDB and backed up with JSON.
6. **Scheduling:** The bot runs indefinitely, posting at fixed intervals.

---

## Disclaimer

This bot is for educational/archival purposes. Respect site usage and Twitter's automation policies.

---

## 📄 License

[MIT](LICENSE)

---

## Contributing

Feel free to open an issue or submit a pull request!

---

## 👤 Author

- [ADiBariya](https://github.com/ADiBariya)
