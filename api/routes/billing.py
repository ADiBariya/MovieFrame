from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from config import settings
from database import get_db
from deps import get_current_user
from models import BillingPlan, SubscriptionStatus

router = APIRouter(prefix="/billing", tags=["billing"])

PLANS: list[BillingPlan] = [
    BillingPlan(
        id="free",
        name="Free",
        price=0,
        interval="month",
        features=[
            "1 post per day",
            "Twitter/X only",
            "Basic analytics",
            "Community support",
        ],
    ),
    BillingPlan(
        id="pro",
        name="Pro",
        price=19,
        interval="month",
        features=[
            "Unlimited posts",
            "Twitter/X + Instagram",
            "Advanced analytics",
            "Priority support",
            "Custom hashtags",
            "Scheduling",
        ],
        stripe_price_id=settings.stripe_pro_price_id or None,
    ),
    BillingPlan(
        id="business",
        name="Business",
        price=49,
        interval="month",
        features=[
            "Everything in Pro",
            "All platforms",
            "Team accounts (5 seats)",
            "API access",
            "Dedicated support",
            "White-label reports",
        ],
        stripe_price_id=settings.stripe_business_price_id or None,
    ),
]


@router.get("/plans", response_model=list[BillingPlan])
async def list_plans():
    return PLANS


@router.post("/subscribe")
async def create_checkout_session(
    plan_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    # TODO: integrate Stripe Checkout
    # import stripe
    # stripe.api_key = settings.stripe_secret_key
    # session = stripe.checkout.Session.create(...)
    raise HTTPException(status_code=501, detail="Stripe integration coming soon")


@router.get("/portal")
async def billing_portal(current_user: Annotated[dict, Depends(get_current_user)]):
    # TODO: integrate Stripe Customer Portal
    raise HTTPException(status_code=501, detail="Stripe integration coming soon")


@router.get("/status", response_model=SubscriptionStatus)
async def billing_status(current_user: Annotated[dict, Depends(get_current_user)]):
    plan = current_user.get("plan", "free")
    return SubscriptionStatus(
        plan=plan,
        status="active",
        current_period_end=None,
        cancel_at_period_end=False,
    )
