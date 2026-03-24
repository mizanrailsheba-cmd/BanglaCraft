from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..dependencies import get_db
from ..schemas.auth import UserRegister, UserLogin, Token
from ..schemas.user import UserOut
from ..utils.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from ..models.user import User

router = APIRouter(prefix='/api/auth', tags=['auth'])


@router.post('/register', response_model=UserOut)
def register(auth_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == auth_in.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Email already registered')

    user = User(
        full_name=auth_in.full_name,
        email=auth_in.email,
        phone=auth_in.phone,
        hashed_password=get_password_hash(auth_in.password),
        preferred_language=auth_in.preferred_language or 'en',
        status='active' if auth_in.preferred_language else 'pending',
        role='customer',
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post('/login', response_model=Token)
def login(auth_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == auth_in.email).first()
    if not user or not verify_password(auth_in.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials')
    if user.status != 'active':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='User not active')

    access_token = create_access_token(subject=str(user.id), role=user.role)
    refresh_token = create_refresh_token(subject=str(user.id))

    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post('/refresh', response_model=Token)
def refresh(token: str):
    payload = None
    from ..utils.security import decode_token
    payload = decode_token(token)
    if not payload.get('sub'):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid refresh token')

    db = next(get_db())
    user = db.query(User).filter(User.id == payload['sub']).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User not found')

    access_token = create_access_token(subject=str(user.id), role=user.role)
    refresh_token = create_refresh_token(subject=str(user.id))
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post('/logout')
def logout():
    return {'status': 'success', 'message': 'Logged out successfully'}
