import os
import cloudinary
import cloudinary.uploader
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# আপনার লোকাল ফাইল থেকে ইমপোর্ট
from .config import settings
from .database import engine, Base
from .models import * # noqa
from .routers import auth, users, products, categories, payments, site_settings, admin
from .utils import security

# .env ফাইল লোড করা
load_dotenv()

# ১. Cloudinary কনফিগারেশন
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

app = FastAPI(title='BanglaCraft API', version='1.0')

# ২. CORS কনফিগারেশন (Local এবং Vercel প্রোডাকশন দুইটার জন্যই)
# settings.FRONTEND_URL এর পাশাপাশি সরাসরি '*' বা নির্দিষ্ট ডোমেইন যোগ করা হয়েছে
origins = [
    str(settings.FRONTEND_URL), 
    "http://localhost:5173",          # Vite Local
    "https://banglacraft.vercel.app"   # আপনার Vercel ডোমেইন (ভবিষ্যতে যেটা হবে)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # প্রোডাকশনে চাইলে শুধু origins লিস্টটি দিতে পারেন
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# ৩. রাউটারগুলো ইনক্লুড করা
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(payments.router)
app.include_router(site_settings.router)
app.include_router(admin.router)

# ৪. ডাটাবেস টেবিল তৈরি (Startup Event)
@app.on_event('startup')
def startup_event():
    # Render বা Neon এ কানেক্ট হওয়ার পর টেবিল তৈরি করবে
    Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"status": "Online", "message": "BanglaCraft API is running smoothly!"}