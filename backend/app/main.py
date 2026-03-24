from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import engine
from .models import *  # noqa
from .routers import auth, users, products, categories, payments, site_settings, admin

from .utils import security

app = FastAPI(title='BanglaCraft API', version='1.0')

origins = [str(settings.FRONTEND_URL)]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
    # Create tables if they do not exist (for local development)
    from .database import Base
    Base.metadata.create_all(bind=engine)
