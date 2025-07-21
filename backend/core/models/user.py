from typing import Optional

class User:
    def __init__(self, email: str, hashed_password: str, name: Optional[str] = None, _id: Optional[str] = None):
        self.email = email
        self.hashed_password = hashed_password
        self.name = name
        self.id = _id 