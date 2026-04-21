# 🤖 Twitter Meme Bot — Full Automation

Google Trends se trending topic uthao → Reddit se viral meme lo → NVIDIA AI se caption banao → Twitter pe post karo. **Fully automatic, har ghante.**

---

## ⚡ Features

- 📈 **Google Trends** se real-time aur daily trending topics
- 🖼️ **Reddit** se viral meme images (5000+ upvotes wale)
- 🤖 **NVIDIA AI (LLaMA 70B)** se funny meme captions
- 🎨 **PIL** se classic meme-style text overlay
- 🐦 **Tweepy v2** se automatic Twitter posting
- ⏰ **APScheduler** se har ghante automatic post
- 🛡️ Duplicate prevention — ek hi topic baar-baar nahi jaata
- 📋 Full logging system

---

## 📁 Project Structure

```
twitter_meme_bot/
├── main.py              ← Yahi run karo (entry point)
├── bot.py               ← Main orchestrator
├── config.py            ← Saari settings & API keys
├── trends_fetcher.py    ← Google Trends integration
├── reddit_fetcher.py    ← Reddit viral memes
├── nvidia_client.py     ← AI caption generation
├── meme_builder.py      ← Image text overlay
├── twitter_poster.py    ← Twitter API posting
├── requirements.txt     ← Python packages
├── Dockerfile           ← Container deployment
├── railway.toml         ← Railway.app config
└── .env.example         ← Keys template
```

---

## 🔑 Step 1 — API Keys Setup

### 1. NVIDIA API Key
1. Jao: https://build.nvidia.com
2. Sign up / login karo
3. Koi bhi model choose karo (jaise LLaMA 3.1 70B)
4. "Get API Key" button dabao
5. Key copy karo → `config.py` mein `NVIDIA_API_KEY` mein daalo

### 2. Twitter / X API Keys
1. Jao: https://developer.twitter.com
2. "Create Project" → "Create App" karo
3. **Read & Write** permissions enable karo (important!)
4. Ye 5 cheezein chahiye:
   - API Key
   - API Key Secret
   - Access Token
   - Access Token Secret
   - Bearer Token
5. `config.py` mein daalo

### 3. Reddit API (Optional, memes ke liye better)
1. Jao: https://www.reddit.com/prefs/apps
2. "create another app" → "script" type choose karo
3. Client ID aur Client Secret copy karo
4. `config.py` mein daalo

---

## 🚀 Step 2 — Local Chalao

```bash
# 1. Clone karo ya files download karo
cd twitter_meme_bot

# 2. Virtual environment banao
python -m venv venv
source venv/bin/activate      # Linux/Mac
# ya
venv\Scripts\activate         # Windows

# 3. Dependencies install karo
pip install -r requirements.txt

# 4. config.py mein apni API keys daalo
nano config.py    # ya koi bhi editor

# 5. Bot chalao!
python main.py
```

Bot automatically:
- Pehla post turant karega
- Phir har 1 ghante mein post karta rahega

---

## ☁️ Step 3 — Free Cloud Deployment (Railway.app)

### Railway pe deploy karo (sabse easy):

1. **GitHub pe push karo:**
   ```bash
   git init
   git add .
   git commit -m "Initial bot"
   git remote add origin https://github.com/TUMHARA_USERNAME/meme-bot.git
   git push -u origin main
   ```

2. **Railway.app pe:**
   - Jao: https://railway.app
   - "New Project" → "Deploy from GitHub repo"
   - Apna repo select karo

3. **Environment variables add karo:**
   - Railway dashboard → Variables tab
   - `.env.example` ke saare variables add karo apni keys ke saath

4. **Deploy!** Railway automatically Dockerfile se build karega

### Alternative: Render.com
1. https://render.com → New Web Service
2. GitHub repo connect karo
3. Environment type: Docker
4. Environment variables add karo
5. Deploy!

---

## ⚙️ Configuration

`config.py` mein ye settings change kar sakte ho:

| Setting | Default | Matlab |
|---------|---------|--------|
| `TRENDS_GEO` | `"IN"` | Trending topics kahan ke (IN=India, US=USA, ""=World) |
| `POST_INTERVAL_HOURS` | `1` | Kitne ghante mein post hoga |
| `MIN_REDDIT_UPVOTES` | `5000` | Minimum upvotes wale memes |
| `MAX_MEME_AGE_HOURS` | `24` | Kitne purane memes accept honge |
| `NVIDIA_MODEL` | `meta/llama-3.3-70b-instruct` | AI model |

---

## 🔍 Logs Dekhna

```bash
# Live logs
tail -f logs/bot.log

# Last 50 lines
tail -50 logs/bot.log
```

---

## ❓ Troubleshooting

**Twitter auth fail?**
→ Developer account pe Read+Write permissions check karo
→ Access tokens regenerate karo after permissions change

**NVIDIA API error?**
→ build.nvidia.com pe API key valid hai check karo
→ Model name sahi hai confirm karo

**Google Trends rate limit?**
→ Normal hai, bot fallback topics use karega automatically

**Reddit memes nahi aa rahe?**
→ Reddit API keys check karo, ya sirf templates use honge (fallback)

---

## 📊 Twitter API Limits (Free Tier)

- 1,500 tweets/month
- Har ghante post = ~720 tweets/month ✅ (limit ke andar)

---

## 🛑 Bot Band Karna

```bash
# Local pe
Ctrl + C

# Docker pe
docker stop meme-bot
```
