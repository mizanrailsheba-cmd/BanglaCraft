import uuid
from datetime import datetime
from sqlalchemy import Column, String, Enum, Numeric, Integer, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from .guid import GUID
from ..database import Base


class Voucher(Base):
    __tablename__ = 'vouchers'

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    code = Column(String(64), unique=True, nullable=False)
    type = Column(Enum('percentage','fixed', name='voucher_type'), nullable=False)
    value = Column(Numeric(10,2), nullable=False)
    min_order_amount = Column(Numeric(10,2), default=0, nullable=False)
    max_uses = Column(Integer, nullable=True)
    used_count = Column(Integer, default=0, nullable=False)
    valid_from = Column(DateTime, nullable=False)
    valid_until = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_by = Column(GUID(), ForeignKey('users.id'), nullable=True)

    creator = relationship('User')
