# BanglaCraft

## Overview
BanglaCraft is a full-stack e-commerce application inspired by Aarong, built with a warm, earthy visual identity and complete Bangla/English bilingual support. The backend is powered by FastAPI, SQLAlchemy and PostgreSQL; the frontend uses React + Vite + Tailwind and i18next.

### Brand identity
- Name: BanglaCraft
- Tagline EN: "Crafted with Heart, Rooted in Bangladesh"
- Tagline BN: "হৃদয় দিয়ে তৈরি, বাংলাদেশের শিকড়ে"
- Theme colors: terracotta (#C0622F), forest green (#2D5016), gold (#D4A017), cream (#FDF6EC), WhatsApp green (#25D366)
- Fonts: Playfair Display (headings), Inter (body), Hind Siliguri / Noto Sans Bengali (BN)

## স্থানীয় সেটআপ (Local Setup)

### Backend
1. `cd backend`
2. `python -m venv .venv && .\.venv\Scripts\activate`
3. `pip install -r requirements.txt`
4. `.env` তৈরি করুন `backend/.env.example` থেকে মান কপি করে।
5. `alembic upgrade head` চালান (বা `python seed.py`)।
6. `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

### Frontend
1. `cd frontend`
2. `npm install`
3. `.env` ফাইল তৈরি (ফিল্ড পূরণ):
   - `VITE_API_BASE_URL=http://localhost:8000`
   - `VITE_APP_NAME=BanglaCraft`
   - `VITE_WHATSAPP_NUMBER=8801XXXXXXXXX`
   - `VITE_DEFAULT_LANGUAGE=en`
4. `npm run dev`

## পরিবেশ ভেরিয়েবল (Environment Variables)

### Backend `.env`
- DATABASE_URL
- REDIS_URL
- SECRET_KEY
- ALGORITHM=HS256
- ACCESS_TOKEN_EXPIRE_MINUTES
- REFRESH_TOKEN_EXPIRE_DAYS
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- SENDGRID_API_KEY
- FROM_EMAIL
- SSLCOMMERZ_STORE_ID
- SSLCOMMERZ_STORE_PASS
- SSLCOMMERZ_IS_SANDBOX
- BKASH_APP_KEY
- BKASH_APP_SECRET
- BKASH_USERNAME
- BKASH_PASSWORD
- BKASH_IS_SANDBOX
- FRONTEND_URL
- AUTO_APPROVE_USERS
- FIRST_ADMIN_EMAIL

### Frontend `.env`
- VITE_API_BASE_URL
- VITE_APP_NAME
- VITE_WHATSAPP_NUMBER
- VITE_DEFAULT_LANGUAGE

## ডেপ্লয়মেন্ট (Deployment)

### Backend — Render
- `backend/render.yaml` প্রস্তুত।
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend — Vercel
- `frontend/vercel.json` প্রস্তুত।
- Rewrites দু:
  - `{ "source": "/(.*)", "destination": "/index.html" }`
- পরিবেশ ভেরিয়েবল সিঙ্ক করুন `VITE_API_BASE_URL`, `VITE_APP_NAME`, `VITE_WHATSAPP_NUMBER`, `VITE_DEFAULT_LANGUAGE`

## এপিআই ডকুমেন্টেশন (API Summary)

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/refresh`
- POST `/api/auth/logout`

### Users
- GET `/api/users/me`
- PUT `/api/users/me`
- PUT `/api/users/me/password`
- PUT `/api/users/me/language`

### Products
- GET `/api/products`
- GET `/api/products/{slug}`
- POST `/api/products`
- PUT `/api/products/{id}`
- DELETE `/api/products/{id}`

### Categories
- GET `/api/categories`
- POST `/api/categories` (admin)

### Payments
- POST `/api/payments/sslcommerz/initiate`
- POST `/api/payments/sslcommerz/success`
- POST `/api/payments/sslcommerz/fail`
- POST `/api/payments/sslcommerz/cancel`
- POST `/api/payments/sslcommerz/ipn`
- POST `/api/payments/bkash/create`
- POST `/api/payments/bkash/execute`
- POST `/api/payments/bkash/callback`
- POST `/api/payments/bkash/refund/{id}`

### Admin
- GET `/api/admin/users`
- PUT `/api/admin/users/{id}/status`
- DELETE `/api/admin/users/{id}`
- GET `/api/admin/settings`
- PUT `/api/admin/settings/{key}`

## ডিফল্ট অ্যাডমিন (Default Admin)
- Email: `admin@banglacraft.com` (default from FIRST_ADMIN_EMAIL)
- Password: `BanglaCraft@Admin1`

## WhatsApp কনফিগারেশন
- ফ্রন্টএন্ড `.env` এ `VITE_WHATSAPP_NUMBER=8801XXXXXXXXX`
- ব্যাকএন্ড `site_settings` টেবিলে `whatsapp_number`
- UI বাটন: `components/WhatsAppButton.jsx`, `components/WhatsAppProductBtn.jsx`

## ভাষা পরিবর্তন (Language Toggle)
- `components/LanguageSwitcher.jsx`
- `react-i18next` + `i18next`
- `localStorage` এ `lang` সেভ হয়
- `src/locales/en/translation.json` + `bn/translation.json`

---

### নোট
- এখানে প্রোডাকশন-গ্রেড স্ট্যাকের যথাসম্ভব স্কেলারযোগ্য বেসলাইন তৈরি করা হয়েছে।
- রিয়েল গেটওয়ে ইন্টিগ্রেশন (SSLCommerz, bKash) প্রোডাকশন এ কনফিগার ট্রাই করার সময় API কী ও সিক্রেট ভেরিয়েবল যোগ করুন।
- ডেটা সেন্সিটিভ অ্যাপ্লিকেশন চালু করার জন্য HTTPS, অনুমোদন হেডার ও ইউজার ইনপুট ভ্যালিডেশন অবশ্যই সক্রিয় রাখুন।
