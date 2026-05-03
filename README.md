# 🎬 MovieFrame

> **Automate your cinematic content.** Scrape stunning film frames from [film-grab.com](https://film-grab.com) and post them to Twitter/X — fully automated.

[![CI](https://github.com/ADiBariya/MovieFrame/actions/workflows/ci.yml/badge.svg)](https://github.com/ADiBariya/MovieFrame/actions/workflows/ci.yml)

---

## Architecture

```
MovieFrame/
├── main.py               # Core bot: scrape + post loop
├── movie.py              # Film-grab.com scraper
├── twitter_poster.py     # Twitter/X Selenium poster
│
├── api/                  # FastAPI backend (SaaS API)
│   ├── main.py           # App + CORS + routes
│   ├── models.py         # Pydantic schemas
│   ├── auth.py           # JWT + password hashing
│   ├── config.py         # Settings (pydantic-settings)
│   ├── database.py       # Motor MongoDB client
│   ├── deps.py           # FastAPI dependency injection
│   └── routes/
│       ├── auth.py       # POST /auth/register|login, GET /auth/me
│       ├── automations.py# GET|POST /automations/run + history
│       ├── platforms.py  # CRUD /platforms
│       ├── analytics.py  # GET /analytics/overview|history
│       └── billing.py    # GET /billing/plans|status (Stripe stub)
│
└── frontend/             # Next.js 14 App Router (SaaS UI)
    └── src/
        ├── app/
        │   ├── page.tsx                  # Landing page
        │   ├── (marketing)/pricing/      # Pricing page
        │   ├── (auth)/login|register/    # Auth pages
        │   └── (app)/dashboard|automations|platforms|analytics|billing|settings/
        ├── components/
        │   ├── ui/           # Button, Input, Card, Modal, StatusBadge, Skeleton
        │   ├── marketing/    # HeroSection, FeaturesSection, PricingSection…
        │   ├── app/          # Sidebar, Topbar, StatsCard, RunHistoryTable
        │   └── shared/       # Navbar, Footer
        ├── hooks/            # useAuth, useAutomations
        ├── lib/              # api.ts (typed client), auth.ts, utils.ts
        └── types/            # index.ts (all shared TS types)
```

---

## Quick Start

### 1. Clone & configure

```bash
git clone https://github.com/ADiBariya/MovieFrame.git
cd MovieFrame

# Bot credentials
cp .env.example .env
# Edit .env with your Twitter API keys
```

### 2. Run the bot (original)

```bash
pip install -r requirements.txt
python main.py
```

### 3. Start the FastAPI backend

```bash
cd api
cp .env.example .env        # Edit with MongoDB URI + JWT secret
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Docs: http://localhost:8000/docs
```

### 4. Start the Next.js frontend

```bash
cd frontend
cp .env.example .env.local  # Edit NEXT_PUBLIC_API_URL
npm install
npm run dev
# App: http://localhost:3000
```

---

## SaaS Features

### 🔐 Authentication
- JWT-based auth (register / login / forgot-password)
- Tokens stored in cookies + localStorage
- Auto-redirect to `/login` on 401

### 🤖 Automation Dashboard
- Trigger bot runs via UI
- Configure pages to scrape, hashtags, platform
- Real-time run status (queued → running → succeeded/failed)
- Per-run log viewer

### 🔗 Platform Connections
- Connect Twitter/X, Instagram, Reddit
- Visual status indicators
- Secure credential storage

### 📊 Analytics
- Area chart: posts over time (last 30 days)
- Bar chart: success vs failed runs
- KPI cards: total posts, success rate, time saved

### 💳 Billing (Stripe stub)
| Plan       | Price | Highlights                               |
|------------|-------|------------------------------------------|
| Free       | $0    | 1 post/day, Twitter only                 |
| Pro        | $19/mo| Unlimited posts, multi-platform          |
| Business   | $49/mo| All platforms, team seats, API access    |

Stripe checkout integration is stubbed — ready to wire up `sk_live_...`.

---

## Environment Variables

### `api/.env`
| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `FRONTEND_URL` | Frontend origin for CORS |

### `frontend/.env.local`
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | FastAPI base URL (`http://localhost:8000`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Bot | Python, BeautifulSoup, Selenium, Tweepy |
| API | FastAPI, Motor (async MongoDB), python-jose, passlib |
| Frontend | Next.js 14 App Router, TypeScript, Tailwind CSS v4 |
| Charts | Recharts |
| Forms | react-hook-form + zod |
| Payments | Stripe (stubbed) |
| CI | GitHub Actions |

---

## Color Palette (Cinema-dark)

| Token | Value | Usage |
|---|---|---|
| `cinema-bg` | `#0A0A0F` | Page background |
| `cinema-surface` | `#111118` | Cards, panels |
| `cinema-primary` | `#F59E0B` | CTA buttons, active states |
| `cinema-secondary` | `#6366F1` | Secondary accents |
| `cinema-accent` | `#EC4899` | Gradient highlights |

---

## License

MIT © ADiBariya
