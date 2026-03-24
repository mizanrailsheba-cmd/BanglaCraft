import uuid
from datetime import datetime
from sqlalchemy import Column, ForeignKey, Enum, Numeric, JSON, String, DateTime
from sqlalchemy.orm import relationship

from .guid import GUID
from ..database import Base


class Order(Base):
    __tablename__ = 'orders'

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey('users.id'), nullable=False)
    status = Column(Enum('pending','confirmed','processing','shipped','delivered','cancelled', name='order_status'), default='pending', nullable=False)
    subtotal = Column(Numeric(10,2), default=0, nullable=False)
    discount_amount = Column(Numeric(10,2), default=0, nullable=False)
    delivery_charge = Column(Numeric(10,2), default=0, nullable=False)
    total_amount = Column(Numeric(10,2), default=0, nullable=False)
    payment_method = Column(Enum('sslcommerz','bkash','cod', name='payment_methods'), default='cod', nullable=False)
    payment_status = Column(Enum('unpaid','paid','refunded', name='payment_status'), default='unpaid', nullable=False)
    payment_transaction_id = Column(String(255), nullable=True)
    shipping_address = Column(JSON, nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship('User', back_populates='orders')
    items = relationship('OrderItem', back_populates='order')


class OrderItem(Base):
    __tablename__ = 'order_items'

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    order_id = Column(GUID(), ForeignKey('orders.id'), nullable=False)
    product_id = Column(GUID(), ForeignKey('products.id'), nullable=False)
    quantity = Column(Numeric(10,2), default=1, nullable=False)
    unit_price = Column(Numeric(10,2), nullable=False)
    total_price = Column(Numeric(10,2), nullable=False)
    product_snapshot = Column(JSON, nullable=False)

    order = relationship('Order', back_populates='items')
    product = relationship('Product', back_populates='order_items')
