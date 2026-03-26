import os
import cloudinary
import cloudinary.uploader
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .config import settings
from .database import engine, Base
from .models import *  # noqa
from .routers import auth, users, products, categories, payments, site_settings, admin
from .utils import security

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

app = FastAPI(title='BanglaCraft API', version='1.0')

origins = [
    str(settings.FRONTEND_URL),
    "http://localhost:5173",
    "https://banglacraft.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(payments.router)
app.include_router(site_settings.router)
app.include_router(admin.router)


@app.on_event('startup')
def startup_event():
    Base.metadata.create_all(bind=engine)

    from .database import SessionLocal
    from .seed import ensure_admin  # ✅ fix: from app. → from .

    db = SessionLocal()
    try:
        ensure_admin(db)
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"status": "Online", "message": "BanglaCraft API is running smoothly!"}