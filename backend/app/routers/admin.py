from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..dependencies import get_db, admin_required
from ..models.user import User
from ..schemas.user import UserOut

router = APIRouter(prefix='/api/admin', tags=['admin'])


@router.get('/users', response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), _: any = Depends(admin_required)):
    return db.query(User).all()


@router.put('/users/{user_id}/status')
def update_user_status(user_id: str, status: str, days: int = 0, db: Session = Depends(get_db), _: any = Depends(admin_required)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, 'User not found')
    user.status = status
    if status == 'suspended' and days > 0:
        from datetime import datetime, timedelta
        user.suspension_until = datetime.utcnow() + timedelta(days=days)
    db.add(user)
    db.commit()
    return {'status': 'updated'}


@router.delete('/users/{user_id}')
def delete_user(user_id: str, db: Session = Depends(get_db), _: any = Depends(admin_required)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, 'User not found')
    user.status = 'deleted'
    db.add(user)
    db.commit()
    return {'status': 'deleted'}
