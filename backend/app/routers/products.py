from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from ..dependencies import get_db, get_current_user, seller_or_admin
from ..models.product import Product
from ..schemas.product import ProductCreate, ProductOut, ProductUpdate

router = APIRouter(prefix='/api/products', tags=['products'])


@router.post('/', response_model=ProductOut)
def create_product(payload: ProductCreate, db: Session = Depends(get_db), current_user=Depends(seller_or_admin)):
    from slugify import slugify
    slug = payload.slug or slugify(payload.name_en)
    existing = db.query(Product).filter(Product.slug == slug).first()
    if existing:
        raise HTTPException(status_code=400, detail='Product slug already exists')
    product = Product(**payload.dict(), seller_id=current_user.id, slug=slug)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get('/', response_model=List[ProductOut])
def list_products(q: str = Query(None), category: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(Product).filter(Product.status == 'active', Product.is_approved == True)
    if q:
        query = query.filter((Product.name_en.ilike(f'%{q}%')) | (Product.name_bn.ilike(f'%{q}%')))
    if category:
        query = query.join('category').filter(Product.category.has(slug=category))
    return query.order_by(Product.created_at.desc()).all()


@router.get('/{slug}', response_model=ProductOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.slug == slug, Product.status == 'active').first()
    if not product:
        raise HTTPException(status_code=404, detail='Product not found')
    return product


@router.put('/{product_id}', response_model=ProductOut)
def update_product(product_id: str, payload: ProductUpdate, db: Session = Depends(get_db), current_user=Depends(seller_or_admin)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail='Product not found')
    if current_user.role != 'admin' and product.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail='Not allowed')
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(product, k, v)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.delete('/{product_id}')
def delete_product(product_id: str, db: Session = Depends(get_db), current_user=Depends(seller_or_admin)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail='Product not found')
    if current_user.role != 'admin' and product.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail='Not allowed')
    product.status = 'archived'
    db.add(product)
    db.commit()
    return {'status': 'success'}
