from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..models.user import User
from ..schemas.user import UserOut, UserUpdate

router = APIRouter(prefix='/api/users', tags=['users'])


@router.get('/me', response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put('/me', response_model=UserOut)
def update_me(payload: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put('/me/password')
def change_password(old_password: str, new_password: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from ..utils.security import verify_password, get_password_hash
    if not verify_password(old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail='Old password incorrect')
    current_user.hashed_password = get_password_hash(new_password)
    db.add(current_user)
    db.commit()
    return {'status': 'success', 'message': 'Password updated'}


@router.put('/me/language')
def set_language(preferred_language: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if preferred_language not in ['en', 'bn']:
        raise HTTPException(status_code=400, detail='Invalid language code')
    current_user.preferred_language = preferred_language
    db.add(current_user)
    db.commit()
    return {'status': 'success', 'preferred_language': preferred_language}
