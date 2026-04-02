from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth, users, products, categories, payments, orders, admin, reviews, site_settings
from .database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="BanglaCraft API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(payments.router)
app.include_router(orders.router)
app.include_router(admin.router)
app.include_router(reviews.router)
app.include_router(site_settings.router)

@app.get("/")
def root():
    return {"message": "BanglaCraft API is running"}
