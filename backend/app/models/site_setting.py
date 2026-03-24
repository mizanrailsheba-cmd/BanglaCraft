import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from .guid import GUID
from ..database import Base


class SiteSetting(Base):
    __tablename__ = 'site_settings'

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    key = Column(String(128), unique=True, nullable=False)
    value = Column(String(1024), nullable=False)
    updated_by = Column(GUID(), ForeignKey('users.id'), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    updated_by_user = relationship('User')
