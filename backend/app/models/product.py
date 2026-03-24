import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, Numeric, Integer, Boolean, Enum, JSON, DateTime
from sqlalchemy.orm import relationship

from .guid import GUID
from ..database import Base


class Product(Base):
    __tablename__ = 'products'

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    seller_id = Column(GUID(), ForeignKey('users.id'), nullable=False)
    name_en = Column(String(255), nullable=False)
    name_bn = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description_en = Column(String, nullable=False)
    description_bn = Column(String, nullable=False)
    sku = Column(String(128), nullable=True)
    price = Column(Numeric(10,2), nullable=False)
    sale_price = Column(Numeric(10,2), nullable=True)
    stock_quantity = Column(Integer, default=0, nullable=False)
    category_id = Column(GUID(), ForeignKey('categories.id'), nullable=False)
    images = Column(JSON, default=list)
    tags = Column(JSON, default=list)
    status = Column(Enum('draft', 'active', 'archived', name='product_status'), default='draft', nullable=False)
    is_approved = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    seller = relationship('User', back_populates='products')
    category = relationship('Category', back_populates='products')
    order_items = relationship('OrderItem', back_populates='product')
