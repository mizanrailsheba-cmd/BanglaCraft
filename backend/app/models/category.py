import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship

from .guid import GUID
from ..database import Base


class Category(Base):
    __tablename__ = 'categories'

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    name_en = Column(String(255), nullable=False)
    name_bn = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    parent_id = Column(GUID(), ForeignKey('categories.id'), nullable=True)
    image_url = Column(String(1024), nullable=True)

    parent = relationship('Category', remote_side=[id])
    products = relationship('Product', back_populates='category')
