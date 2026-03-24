from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from .config import settings

# Neon PostgreSQL needs connect_args for SSL
connect_args = {}
if "postgresql" in settings.DATABASE_URL:
    connect_args = {"sslmode": "require"}

engine = create_engine(
    settings.DATABASE_URL,
    future=True,
    pool_pre_ping=True,
    connect_args=connect_args,
    # Neon এর জন্য connection pool settings
    pool_size=5,
    max_overflow=10,
    pool_recycle=300,  # 5 minutes — Neon idle connection বন্ধ করে দেয়
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()