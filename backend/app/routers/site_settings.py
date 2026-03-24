from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..dependencies import get_db, admin_required
from ..models.site_setting import SiteSetting
from ..schemas.site_setting import SiteSettingOut

router = APIRouter(prefix='/api/admin/settings', tags=['admin'])


@router.get('/', response_model=List[SiteSettingOut])
def get_settings(db: Session = Depends(get_db), _: any = Depends(admin_required)):
    return db.query(SiteSetting).all()


@router.put('/{key}', response_model=SiteSettingOut)
def update_setting(key: str, value: str, db: Session = Depends(get_db), current_user=Depends(admin_required)):
    setting = db.query(SiteSetting).filter(SiteSetting.key == key).first()
    if not setting:
        raise HTTPException(status_code=404, detail='Setting not found')
    setting.value = value
    setting.updated_by = current_user.id
    db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting
