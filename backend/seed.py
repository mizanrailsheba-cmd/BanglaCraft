import os
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import *  # noqa
from app.models.user import User
from app.models.category import Category
from app.models.product import Product
from app.models.site_setting import SiteSetting
from app.models.voucher import Voucher
from app.utils.security import get_password_hash


def ensure_admin(db: Session):
    admin_email = os.getenv('FIRST_ADMIN_EMAIL', 'admin@banglacraft.com')
    admin_password = os.getenv('FIRST_ADMIN_PASSWORD', 'BanglaCraft@Admin1')
    existing = db.query(User).filter(User.email == admin_email).first()
    if not existing:
        admin = User(
            full_name='BanglaCraft Admin',
            email=admin_email,
            phone='+8801XXXXXXXXX',
            hashed_password=get_password_hash(admin_password),
            role='admin',
            status='active',
            preferred_language='en',
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)


def seed():
    Base = __import__('app.database', fromlist=['Base']).Base
    Base.metadata.create_all(engine)
    db: Session = SessionLocal()

    ensure_admin(db)

    categories = [
        ('clothing', 'Clothing', 'পোশাক'),
        ('home-decor', 'Home Decor', 'হোম ডেকোর'),
        ('jewellery', 'Jewellery', 'গহনা'),
        ('accessories', 'Accessories', 'আনুষাঙ্গিক'),
        ('pottery', 'Pottery', 'মৃৎশিল্প'),
        ('nakshi-kantha', 'Nakshi Kantha', 'নকশি কাঁথা'),
    ]

    for slug, en, bn in categories:
        if not db.query(Category).filter(Category.slug == slug).first():
            db.add(Category(name_en=en, name_bn=bn, slug=slug, image_url=''))
    db.commit()

    site_settings = {
        'whatsapp_number': '8801XXXXXXXXX',
        'store_email': 'support@banglacraft.com',
        'store_phone': '+8801XXXXXXXXX',
        'store_address_en': 'Dhaka, Bangladesh',
        'store_address_bn': 'ঢাকা, বাংলাদেশ',
    }
    for key, value in site_settings.items():
        if not db.query(SiteSetting).filter(SiteSetting.key == key).first():
            db.add(SiteSetting(key=key, value=value, updated_at=datetime.utcnow()))
    db.commit()

    if not db.query(Voucher).filter(Voucher.code == 'WELCOME10').first():
        db.add(Voucher(code='WELCOME10', type='percentage', value=10, min_order_amount=500, max_uses=1000, used_count=0, valid_from=datetime.utcnow(), valid_until=datetime.utcnow()+timedelta(days=365), is_active=True))
    if not db.query(Voucher).filter(Voucher.code == 'CRAFT50').first():
        db.add(Voucher(code='CRAFT50', type='fixed', value=50, min_order_amount=1000, max_uses=1000, used_count=0, valid_from=datetime.utcnow(), valid_until=datetime.utcnow()+timedelta(days=365), is_active=True))
    db.commit()

    print('Seed completed')


if __name__ == '__main__':
    seed()
