from pydantic import BaseModel
from typing import List, Optional, Any
from uuid import UUID


class OrderItemIn(BaseModel):
    product_id: UUID
    quantity: int


class OrderCreate(BaseModel):
    items: List[OrderItemIn]
    shipping_address: dict
    notes: Optional[str] = None
    voucher_code: Optional[str] = None
    payment_method: str


class OrderItemOut(BaseModel):
    id: UUID
    product_id: UUID
    quantity: int
    unit_price: float
    total_price: float
    product_snapshot: Any

    class Config:
        orm_mode = True


class OrderOut(BaseModel):
    id: UUID
    user_id: UUID
    status: str
    subtotal: float
    discount_amount: float
    delivery_charge: float
    total_amount: float
    payment_method: str
    payment_status: str
    shipping_address: Any
    notes: Optional[str]
    items: List[OrderItemOut]

    class Config:
        orm_mode = True
