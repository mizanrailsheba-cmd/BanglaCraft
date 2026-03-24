import uuid
from datetime import datetime
from sqlalchemy import Column, String, Enum, Numeric, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from .guid import GUID
from ..database import Base


class Payment(Base):
    __tablename__ = 'payments'

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    order_id = Column(GUID(), ForeignKey('orders.id'), nullable=False)
    method = Column(Enum('sslcommerz','bkash','cod', name='payment_method'), nullable=False)
    transaction_id = Column(String(255), nullable=True)
    amount = Column(Numeric(10,2), nullable=False)
    currency = Column(String(8), default='BDT', nullable=False)
    status = Column(Enum('pending','success','failed','cancelled','refunded', name='payment_status_all'), default='pending', nullable=False)
    gateway_response = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    order = relationship('Order')
