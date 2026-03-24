import uuid
from datetime import datetime
from sqlalchemy import Column, ForeignKey, Integer, DateTime
from sqlalchemy.orm import relationship

from .guid import GUID
from ..database import Base


class CartItem(Base):
    __tablename__ = 'cart_items'

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey('users.id'), nullable=False)
    product_id = Column(GUID(), ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship('User', back_populates='cart_items')
    product = relationship('Product')
