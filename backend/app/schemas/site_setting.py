from pydantic import BaseModel
from uuid import UUID


class SiteSettingBase(BaseModel):
    key: str
    value: str


class SiteSettingOut(SiteSettingBase):
    id: UUID

    class Config:
        orm_mode = True
