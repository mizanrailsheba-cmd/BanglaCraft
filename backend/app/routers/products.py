from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import cloudinary
import cloudinary.uploader
from slugify import slugify

from ..dependencies import get_db, get_current_user, seller_or_admin
from ..models.product import Product
from ..schemas.product import ProductOut

router = APIRouter(prefix='/api/products', tags=['products'])

# ১. প্রোডাক্ট তৈরি করা (ইমেজ আপলোডসহ)
@router.post('/', response_model=ProductOut)
def create_product(
    name_en: str = Form(...),
    name_bn: str = Form(...),
    price: float = Form(...),
    description_en: str = Form(None),
    description_bn: str = Form(None),
    stock: int = Form(0),
    category_id: str = Form(...),
    slug: Optional[str] = Form(None),
    image: UploadFile = File(...), # ইমেজ ফাইল রিসিভ করা
    db: Session = Depends(get_db), 
    current_user = Depends(seller_or_admin)
):
    # স্লাগ (Slug) তৈরি করা
    product_slug = slug or slugify(name_en)
    
    existing = db.query(Product).filter(Product.slug == product_slug).first()
    if existing:
        raise HTTPException(status_code=400, detail='Product slug already exists')

    # ২. ইমেজ ক্লাউডিনারি-তে আপলোড করা
    try:
        upload_result = cloudinary.uploader.upload(
            image.file, 
            folder="banglacraft/products"
        )
        image_url = upload_result.get("secure_url")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

    # ৩. ডাটাবেসে প্রোডাক্ট সেভ করা
    product = Product(
        name_en=name_en,
        name_bn=name_bn,
        price=price,
        description_en=description_en,
        description_bn=description_bn,
        stock=stock,
        category_id=category_id,
        seller_id=current_user.id,
        slug=product_slug,
        image_url=image_url # ডাটাবেসে Cloudinary URL সেভ হবে
    )
    
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

# ৪. সব প্রোডাক্ট লিস্ট করা
@router.get('/', response_model=List[ProductOut])
def list_products(q: str = Query(None), category: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(Product).filter(Product.status == 'active', Product.is_approved == True)
    if q:
        query = query.filter((Product.name_en.ilike(f'%{q}%')) | (Product.name_bn.ilike(f'%{q}%')))
    if category:
        query = query.join('category').filter(Product.category.has(slug=category))
    return query.order_by(Product.created_at.desc()).all()

# ৫. স্লাগ দিয়ে নির্দিষ্ট প্রোডাক্ট দেখা
@router.get('/{slug}', response_model=ProductOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.slug == slug, Product.status == 'active').first()
    if not product:
        raise HTTPException(status_code=404, detail='Product found')
    return product

# ৬. প্রোডাক্ট ডিলিট করা (আর্কাইভ করা)
@router.delete('/{product_id}')
def delete_product(product_id: str, db: Session = Depends(get_db), current_user = Depends(seller_or_admin)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail='Product not found')
    
    if current_user.role != 'admin' and product.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail='Not allowed')
    
    product.status = 'archived'
    db.add(product)
    db.commit()
    return {'status': 'success'}