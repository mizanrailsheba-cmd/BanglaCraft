from pydantic import BaseModel, field_validator
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class ProductBase(BaseModel):
    name_en: str
    name_bn: str
    slug: str
    description_en: str
    description_bn: str
    sku: Optional[str] = None
    price: float
    sale_price: Optional[float] = None
    stock_quantity: int
    category_id: UUID
    images: List[str] = [] # Cloudinary URL-এর লিস্ট এখানে থাকবে
    tags: List[str] = []
    status: str = 'draft'
    is_approved: bool = False

    # Pydantic v2 অনুযায়ী ভ্যালিডেটর আপডেট করা হয়েছে
    @field_validator('slug')
    @classmethod
    def slug_trim(cls, v):
        return v.strip().lower()

class ProductCreate(BaseModel):
    # যেহেতু আমরা Form Data এবং File ব্যবহার করে ইমেজ নিচ্ছি, 
    # তাই Create করার সময় সরাসরি স্কিমা ব্যবহারের চেয়ে রাউটারে Form ব্যবহার করা সহজ।
    # তবে ভ্যালিডেশনের জন্য এটি রাখা যায়।
    pass

class ProductUpdate(BaseModel):
    name_en: Optional[str] = None
    name_bn: Optional[str] = None
    description_en: Optional[str] = None
    description_bn: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    sale_price: Optional[float] = None
    stock_quantity: Optional[int] = None
    category_id: Optional[UUID] = None
    images: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None
    is_approved: Optional[bool] = None

class ProductOut(ProductBase):
    id: UUID
    seller_id: UUID
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True # Pydantic v2 এর জন্য (পুরানো ভার্সনে orm_mode = True)