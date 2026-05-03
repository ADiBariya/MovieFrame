from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId


class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)


# ── Auth ────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    plan: str = "free"
    created_at: datetime
    avatar_url: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ForgotPassword(BaseModel):
    email: EmailStr


# ── Automation ───────────────────────────────────────────────────────────────
class AutomationConfig(BaseModel):
    pages_to_scrape: int = Field(default=3, ge=1, le=10)
    hashtags: list[str] = Field(default_factory=lambda: ["#Cinema", "#MovieFrames"])
    platform: str = "twitter"


class AutomationRunOut(BaseModel):
    id: str
    automation_type: str
    status: str  # queued | running | succeeded | failed
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    logs: list[str] = []
    movie_title: Optional[str] = None
    frame_url: Optional[str] = None
    tweet_url: Optional[str] = None
    user_id: str
    config: Optional[dict] = None


# ── Platform ─────────────────────────────────────────────────────────────────
class PlatformConnect(BaseModel):
    platform: str
    api_key: str
    api_secret: str
    access_token: Optional[str] = None
    access_secret: Optional[str] = None
    bearer_token: Optional[str] = None


class PlatformOut(BaseModel):
    id: str
    platform: str
    connected: bool
    connected_at: Optional[datetime] = None
    username: Optional[str] = None


# ── Analytics ────────────────────────────────────────────────────────────────
class AnalyticsOverview(BaseModel):
    total_runs: int
    successful_runs: int
    failed_runs: int
    success_rate: float
    posts_today: int
    connected_platforms: int
    time_saved_hours: float


class HistoryPoint(BaseModel):
    date: str
    posts: int
    failures: int


# ── Billing ──────────────────────────────────────────────────────────────────
class BillingPlan(BaseModel):
    id: str
    name: str
    price: float
    interval: str
    features: list[str]
    stripe_price_id: Optional[str] = None


class SubscriptionStatus(BaseModel):
    plan: str
    status: str
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: bool = False
