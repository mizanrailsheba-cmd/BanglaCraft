import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship

from .guid import GUID
from ..database import Base


class User(Base):
    __tablename__ = 'users'

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(32), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum('customer', 'seller', 'admin', name='user_roles'), default='customer', nullable=False)
    status = Column(Enum('pending', 'active', 'suspended', 'deleted', name='user_statuses'), default='pending', nullable=False)
    suspension_until = Column(DateTime, nullable=True)
    avatar_url = Column(String(1024), nullable=True)
    preferred_language = Column(Enum('en', 'bn', name='preferred_language'), default='en', nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    products = relationship('Product', back_populates='seller')
    cart_items = relationship('CartItem', back_populates='user')
    orders = relationship('Order', back_populates='user')
    refresh_tokens = relationship('RefreshToken', back_populates='user')
