from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from datetime import datetime

from .database import get_db
from .models import User
from .utils.security import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/api/auth/login')


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_token(token)
    user_id = payload.get('sub')
    role = payload.get('role')
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid authentication credentials')
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.status != 'active':
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Inactive user')
    if user.suspension_until and user.suspension_until > datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Account temporarily suspended')
    return user


def admin_required(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != 'admin':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Admin privileges required')
    return current_user


def seller_or_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ['seller', 'admin']:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Seller or admin privileges required')
    return current_user
