from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth, users, products, categories, orders, admin, reviews
from .database import engine, Base

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="BanglaCraft API", version="1.0.0")

# ── CORS ──────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(orders.router)
app.include_router(admin.router)
app.include_router(reviews.router)

@app.get("/")
def root():
    return {"message": "BanglaCraft API is running"}
