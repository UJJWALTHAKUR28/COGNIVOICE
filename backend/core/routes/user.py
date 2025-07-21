from fastapi import APIRouter, HTTPException, Depends
from core.schemas.user import UserCreate, UserLogin
from core.services.user_service import create_user, authenticate_user, get_user_by_email
from core.security import create_access_token, decode_access_token
from fastapi.security import OAuth2PasswordBearer
from datetime import timedelta

router = APIRouter(prefix="/api", tags=["user"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

@router.post("/signup")
async def signup(user: UserCreate):
    existing = await get_user_by_email(user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = await create_user(user)
    return {"msg": "User created", "user_id": user_id}

@router.post("/login")
async def login(user: UserLogin):
    db_user = await authenticate_user(user)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    user = await get_user_by_email(payload["sub"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {"email": current_user["email"], "name": current_user.get("name")} 