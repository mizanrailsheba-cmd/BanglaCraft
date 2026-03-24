from pydantic import BaseModel, validator
from typing import List, Optional
from uuid import UUID


class ProductBase(BaseModel):
    name_en: str
    name_bn: str
    slug: str
    description_en: str
    description_bn: str
    sku: Optional[str]
    price: float
    sale_price: Optional[float] = None
    stock_quantity: int
    category_id: UUID
    images: Optional[List[str]] = []
    tags: Optional[List[str]] = []
    status: Optional[str] = 'draft'
    is_approved: Optional[bool] = False

    @validator('slug')
    def slug_trim(cls, v):
        return v.strip().lower()


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name_en: Optional[str]
    name_bn: Optional[str]
    description_en: Optional[str]
    description_bn: Optional[str]
    sku: Optional[str]
    price: Optional[float]
    sale_price: Optional[float]
    stock_quantity: Optional[int]
    category_id: Optional[UUID]
    images: Optional[List[str]]
    tags: Optional[List[str]]
    status: Optional[str]
    is_approved: Optional[bool]


class ProductOut(ProductBase):
    id: UUID
    seller_id: UUID

    class Config:
        orm_mode = True
