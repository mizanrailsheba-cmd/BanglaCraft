import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from .guid import GUID
from ..database import Base


class Invoice(Base):
    __tablename__ = 'invoices'

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    order_id = Column(GUID(), ForeignKey('orders.id'), nullable=False)
    invoice_number = Column(String(64), unique=True, nullable=False, index=True)
    issued_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    pdf_url = Column(String(1024), nullable=True)
    created_by = Column(GUID(), ForeignKey('users.id'), nullable=False)

    order = relationship('Order')
    creator = relationship('User')
