from pydantic import AnyUrl, field_validator, model_validator
from pydantic_settings import BaseSettings
from typing import List, Optional
import warnings


class Settings(BaseSettings):
    # ─── Database ────────────────────────────────────────────────
    DATABASE_URL: str

    # ─── Redis (Optional - local dev এ ছাড়াও চলবে) ──────────────
    REDIS_URL: Optional[str] = None

    # ─── Auth ────────────────────────────────────────────────────
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ─── Cloudinary (Image Upload) ───────────────────────────────
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None

    # ─── Email ───────────────────────────────────────────────────
    SENDGRID_API_KEY: Optional[str] = None
    FROM_EMAIL: str = "noreply@banglacraft.com"

    # ─── SSLCommerz ──────────────────────────────────────────────
    SSLCOMMERZ_STORE_ID: Optional[str] = None
    SSLCOMMERZ_STORE_PASS: Optional[str] = None
    SSLCOMMERZ_IS_SANDBOX: bool = True

    # ─── bKash ───────────────────────────────────────────────────
    BKASH_APP_KEY: Optional[str] = None
    BKASH_APP_SECRET: Optional[str] = None
    BKASH_USERNAME: Optional[str] = None
    BKASH_PASSWORD: Optional[str] = None
    BKASH_IS_SANDBOX: bool = True

    # ─── App ─────────────────────────────────────────────────────
    FRONTEND_URL: str = "http://localhost:5173"
    AUTO_APPROVE_USERS: bool = False
    FIRST_ADMIN_EMAIL: Optional[str] = None
    ENVIRONMENT: str = "development"  # "development" | "production"

    # ─── Validators ──────────────────────────────────────────────
    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        if not v:
            raise ValueError("DATABASE_URL must be set")

        # Neon / Render দেয় 'postgres://' কিন্তু SQLAlchemy চায় 'postgresql://'
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql://", 1)

        return v

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        return v

    @model_validator(mode="after")
    def warn_missing_optional_services(self) -> "Settings":
        # Cloudinary না থাকলে warn করবে
        if not self.CLOUDINARY_CLOUD_NAME:
            warnings.warn("⚠️  CLOUDINARY not configured — image upload disabled")

        # Redis না থাকলে warn করবে
        if not self.REDIS_URL:
            warnings.warn("⚠️  REDIS_URL not set — caching/sessions may be affected")

        # Production এ sandbox payment চালু থাকলে warn
        if self.ENVIRONMENT == "production":
            if self.SSLCOMMERZ_IS_SANDBOX:
                warnings.warn("⚠️  SSLCommerz is in SANDBOX mode in production!")
            if self.BKASH_IS_SANDBOX:
                warnings.warn("⚠️  bKash is in SANDBOX mode in production!")

        return self

    # ─── Helper Properties ────────────────────────────────────────
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_postgresql(self) -> bool:
        return "postgresql" in self.DATABASE_URL

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # Extra env vars থাকলে error দেবে না


settings = Settings()