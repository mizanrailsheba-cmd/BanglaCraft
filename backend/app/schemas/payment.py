from pydantic import BaseModel
from uuid import UUID
from typing import Optional, Any


class PaymentIn(BaseModel):
    order_id: UUID
    method: str
    amount: float


class PaymentUpdate(BaseModel):
    status: str
    transaction_id: Optional[str]
    gateway_response: Optional[Any]


class PaymentOut(BaseModel):
    id: UUID
    order_id: UUID
    method: str
    transaction_id: Optional[str]
    amount: float
    currency: str
    status: str
    gateway_response: Optional[Any]

    class Config:
        orm_mode = True
