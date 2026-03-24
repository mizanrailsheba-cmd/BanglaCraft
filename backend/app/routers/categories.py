from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..dependencies import get_db, admin_required
from ..models.category import Category
from ..schemas.category import CategoryCreate, CategoryOut

router = APIRouter(prefix='/api/categories', tags=['categories'])


@router.post('/', response_model=CategoryOut)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db), current_user=Depends(admin_required)):
    existing = db.query(Category).filter(Category.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=409, detail='Category slug exists')
    category = Category(**payload.dict())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.get('/', response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()
