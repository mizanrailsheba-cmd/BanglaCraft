from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str]
    preferred_language: Optional[str] = 'en'

    class Config:
        orm_mode = True


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    id: UUID
    role: str
    status: str
    suspension_until: Optional[str]
    avatar_url: Optional[str]


class UserUpdate(BaseModel):
    full_name: Optional[str]
    phone: Optional[str]
    preferred_language: Optional[str]
