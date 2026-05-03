from datetime import datetime, timezone
from typing import Annotated

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from auth import create_access_token, hash_password, verify_password
from database import get_db
from deps import get_current_user
from models import ForgotPassword, Token, UserCreate, UserLogin, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


def _serialize_user(doc: dict) -> UserOut:
    return UserOut(
        id=str(doc["_id"]),
        name=doc["name"],
        email=doc["email"],
        plan=doc.get("plan", "free"),
        created_at=doc.get("created_at", datetime.now(timezone.utc)),
        avatar_url=doc.get("avatar_url"),
    )


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate):
    db = get_db()
    existing = await db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    doc = {
        "_id": str(ObjectId()),
        "name": payload.name,
        "email": payload.email,
        "hashed_password": hash_password(payload.password),
        "plan": "free",
        "created_at": datetime.now(timezone.utc),
        "avatar_url": None,
    }
    await db.users.insert_one(doc)

    token = create_access_token({"sub": doc["_id"]})
    return Token(access_token=token, user=_serialize_user(doc))


@router.post("/login", response_model=Token)
async def login(payload: UserLogin):
    db = get_db()
    user = await db.users.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user["_id"]})
    return Token(access_token=token, user=_serialize_user(user))


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
async def forgot_password(payload: ForgotPassword):
    # TODO: send reset email via SMTP / SendGrid
    # Always return 202 to avoid user enumeration
    return {"message": "If that email exists, a reset link has been sent."}


@router.get("/me", response_model=UserOut)
async def get_me(current_user: Annotated[dict, Depends(get_current_user)]):
    return _serialize_user(current_user)
