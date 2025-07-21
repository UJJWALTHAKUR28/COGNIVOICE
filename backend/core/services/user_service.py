from core.db.mongo import users_collection
from core.security import hash_password, verify_password
from core.schemas.user import UserCreate, UserLogin, UserInDB
from typing import Optional

async def get_user_by_email(email: str) -> Optional[dict]:
    return await users_collection.find_one({"email": email})

async def create_user(user: UserCreate) -> str:
    hashed = hash_password(user.password)
    user_doc = {"email": user.email, "hashed_password": hashed, "name": user.name}
    result = await users_collection.insert_one(user_doc)
    return str(result.inserted_id)

async def authenticate_user(user: UserLogin) -> Optional[dict]:
    db_user = await get_user_by_email(user.email)
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        return None
    return db_user 