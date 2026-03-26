from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    preferred_language: Optional[str] = 'en'

    model_config = {"from_attributes": True}  # Pydantic V2 fix


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    id: UUID
    role: str
    status: str
    suspension_until: Optional[datetime] = None
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    preferred_language: Optional[str] = None