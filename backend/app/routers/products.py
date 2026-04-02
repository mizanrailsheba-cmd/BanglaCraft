from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import cloudinary
import cloudinary.uploader
from slugify import slugify

from ..dependencies import get_db, get_current_user, seller_or_admin, admin_required
from ..models.product import Product
from ..models.category import Category
from ..schemas.product import ProductOut

router = APIRouter(prefix='/api/products', tags=['products'])


# ── Create product ────────────────────────────────────────────────
@router.post('/', response_model=ProductOut)
def create_product(
    name_en: str = Form(...),
    name_bn: str = Form(...),
    price: float = Form(...),
    sale_price: Optional[float] = Form(None),
    description_en: str = Form(''),
    description_bn: str = Form(''),
    stock_quantity: int = Form(0),
    category_id: str = Form(...),
    slug: Optional[str] = Form(None),
    tags: Optional[str] = Form(''),
    status: Optional[str] = Form('active'),
    images: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user=Depends(seller_or_admin)
):
    product_slug = slug or slugify(name_en)
    existing = db.query(Product).filter(Product.slug == product_slug).first()
    if existing:
        raise HTTPException(status_code=400, detail='Product slug already exists')

    image_urls = []
    for image in images:
        if image and image.filename:
            try:
                upload_result = cloudinary.uploader.upload(
                    image.file,
                    folder="banglacraft/products"
                )
                image_urls.append(upload_result.get("secure_url"))
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

    tags_list = [t.strip() for t in tags.split(',')] if tags else []

    product = Product(
        name_en=name_en,
        name_bn=name_bn,
        price=price,
        sale_price=sale_price,
        description_en=description_en,
        description_bn=description_bn,
        stock_quantity=stock_quantity,
        category_id=category_id,
        seller_id=current_user.id,
        slug=product_slug,
        images=image_urls,
        tags=tags_list,
        status=status,
        is_approved=True if current_user.role == 'admin' else False,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


# ── List all products (public) ────────────────────────────────────
@router.get('/', response_model=List[ProductOut])
def list_products(
    q: str = Query(None),
    category: str = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Product).filter(
        Product.status == 'active',
        Product.is_approved == True
    )
    if q:
        query = query.filter(
            (Product.name_en.ilike(f'%{q}%')) | (Product.name_bn.ilike(f'%{q}%'))
        )
    if category:
        query = query.join(Category).filter(Category.slug == category)
    return query.order_by(Product.created_at.desc()).all()


# ── Admin: list ALL products ──────────────────────────────────────
@router.get('/admin/all')
def admin_list_products(
    db: Session = Depends(get_db),
    _=Depends(admin_required)
):
    products = db.query(Product).order_by(Product.created_at.desc()).all()
    result = []
    for p in products:
        cat = db.query(Category).filter(Category.id == p.category_id).first()
        result.append({
            'id': str(p.id),
            'name_en': p.name_en,
            'name_bn': p.name_bn,
            'slug': p.slug,
            'price': float(p.price),
            'sale_price': float(p.sale_price) if p.sale_price else None,
            'stock_quantity': p.stock_quantity,
            'category_id': str(p.category_id),
            'category_name': cat.name_en if cat else '',
            'images': p.images or [],
            'tags': p.tags or [],
            'status': p.status,
            'is_approved': p.is_approved,
            'description_en': p.description_en,
            'description_bn': p.description_bn,
            'created_at': p.created_at.isoformat(),
        })
    return result


# ── Admin: approve product ────────────────────────────────────────
@router.put('/admin/{product_id}/approve')
def approve_product(
    product_id: str,
    db: Session = Depends(get_db),
    _=Depends(admin_required)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(404, 'Product not found')
    product.is_approved = True
    product.status = 'active'
    db.commit()
    return {'status': 'approved'}


# ── Get by slug (public) ──────────────────────────────────────────
@router.get('/{slug}', response_model=ProductOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(
        Product.slug == slug,
        Product.status == 'active'
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail='Product not found')
    return product


# ── Update product ────────────────────────────────────────────────
@router.put('/{product_id}')
def update_product(
    product_id: str,
    name_en: Optional[str] = Form(None),
    name_bn: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    sale_price: Optional[float] = Form(None),
    description_en: Optional[str] = Form(None),
    description_bn: Optional[str] = Form(None),
    stock_quantity: Optional[int] = Form(None),
    category_id: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    images: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user=Depends(seller_or_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(404, 'Product not found')
    if current_user.role != 'admin' and product.seller_id != current_user.id:
        raise HTTPException(403, 'Not allowed')

    if name_en: product.name_en = name_en
    if name_bn: product.name_bn = name_bn
    if price is not None: product.price = price
    if sale_price is not None: product.sale_price = sale_price
    if description_en: product.description_en = description_en
    if description_bn: product.description_bn = description_bn
    if stock_quantity is not None: product.stock_quantity = stock_quantity
    if category_id: product.category_id = category_id
    if status: product.status = status
    if tags is not None:
        product.tags = [t.strip() for t in tags.split(',')] if tags else []

    # নতুন images আসলে existing এর সাথে যোগ করো
    new_image_urls = []
    for image in images:
        if image and image.filename:
            try:
                upload_result = cloudinary.uploader.upload(
                    image.file,
                    folder="banglacraft/products"
                )
                new_image_urls.append(upload_result.get("secure_url"))
            except Exception as e:
                raise HTTPException(500, f"Image upload failed: {str(e)}")

    if new_image_urls:
        existing_images = product.images or []
        product.images = new_image_urls + existing_images  # নতুন ছবি সামনে

    db.commit()
    db.refresh(product)
    return {'status': 'updated', 'id': str(product.id)}


# ── Delete product ────────────────────────────────────────────────
@router.delete('/{product_id}')
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(seller_or_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail='Product not found')
    if current_user.role != 'admin' and product.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail='Not allowed')
    db.delete(product)
    db.commit()
    return {'status': 'deleted'}