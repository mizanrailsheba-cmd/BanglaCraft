import uuid
from datetime import datetime
from sqlalchemy import Column, ForeignKey, DateTime, Boolean, String
from sqlalchemy.orm import relationship

from .guid import GUID
from ..database import Base


class RefreshToken(Base):
    __tablename__ = 'refresh_tokens'

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey('users.id'), nullable=False)
    token_hash = Column(String(255), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime, nullable=False)
    revoked = Column(Boolean, default=False, nullable=False)

    user = relationship('User', back_populates='refresh_tokens')
