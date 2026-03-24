from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone: Optional[str]
    password: str = Field(..., min_length=8)
    preferred_language: Optional[str] = 'en'


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = 'bearer'


class TokenPayload(BaseModel):
    sub: str
    email: EmailStr
    role: str
    exp: datetime
