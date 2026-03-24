from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class CategoryBase(BaseModel):
    name_en: str
    name_bn: str
    slug: str
    parent_id: Optional[UUID]
    image_url: Optional[str]


class CategoryCreate(CategoryBase):
    pass


class CategoryOut(CategoryBase):
    id: UUID

    class Config:
        orm_mode = True
