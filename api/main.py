from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routes.auth import router as auth_router
from routes.automations import router as automations_router
from routes.platforms import router as platforms_router
from routes.analytics import router as analytics_router
from routes.billing import router as billing_router

app = FastAPI(
    title="MovieFrame API",
    description="SaaS backend for the MovieFrame automation bot",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(automations_router)
app.include_router(platforms_router)
app.include_router(analytics_router)
app.include_router(billing_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "movieframe-api"}
