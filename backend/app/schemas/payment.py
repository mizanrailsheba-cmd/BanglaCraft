from pydantic import BaseModel
from uuid import UUID
from typing import Optional, Any


class PaymentIn(BaseModel):
    order_id: UUID
    method: str
    amount: float


class PaymentUpdate(BaseModel):
    status: str
    transaction_id: Optional[str] = None
    gateway_response: Optional[Any] = None


class PaymentOut(BaseModel):
    id: UUID
    order_id: UUID
    method: str
    transaction_id: Optional[str] = None
    amount: float
    currency: str
    status: str
    gateway_response: Optional[Any] = None

    model_config = {"from_attributes": True}