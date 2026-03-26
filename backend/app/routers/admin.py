from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..dependencies import get_db, admin_required, get_current_user
from ..models.user import User
from ..models.order import Order, OrderItem
from ..schemas.user import UserOut

router = APIRouter(prefix='/api/admin', tags=['admin'])


# ── User list ────────────────────────────────────────────────────

@router.get('/users', response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    _: any = Depends(admin_required)
):
    return db.query(User).filter(User.status != 'deleted').all()


# ── User status update (suspend/activate) ────────────────────────

@router.put('/users/{user_id}/status')
def update_user_status(
    user_id: str,
    status: str,
    days: int = 0,
    db: Session = Depends(get_db),
    _: any = Depends(admin_required)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, 'User not found')
    user.status = status
    if status == 'suspended' and days > 0:
        user.suspension_until = datetime.utcnow() + timedelta(days=days)
    db.add(user)
    db.commit()
    return {'status': 'updated'}


# ── Soft delete user ─────────────────────────────────────────────

@router.delete('/users/{user_id}')
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    _: any = Depends(admin_required)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, 'User not found')
    user.status = 'deleted'
    db.add(user)
    db.commit()
    return {'status': 'deleted'}


# ── Add user ─────────────────────────────────────────────────────

@router.post('/users', response_model=UserOut)
def create_user(
    full_name: str,
    email: str,
    password: str,
    role: str = 'customer',
    db: Session = Depends(get_db),
    _: any = Depends(admin_required)
):
    from ..utils.security import get_password_hash
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(409, 'Email already exists')
    user = User(
        full_name=full_name,
        email=email,
        hashed_password=get_password_hash(password),
        role=role,
        status='active'
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ── Change user role ─────────────────────────────────────────────

@router.put('/users/{user_id}/role')
def update_user_role(
    user_id: str,
    role: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(admin_required)
):
    if str(current_admin.id) == user_id:
        raise HTTPException(400, 'Cannot change your own role')
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, 'User not found')
    if role not in ('customer', 'seller', 'admin'):
        raise HTTPException(400, 'Invalid role')
    user.role = role
    db.commit()
    return {'status': 'updated', 'role': role}


# ── Admin change own password ────────────────────────────────────

@router.post('/change-password')
def admin_change_password(
    old_password: str,
    new_password: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(admin_required)
):
    from ..utils.security import verify_password, get_password_hash
    if not verify_password(old_password, current_admin.hashed_password):
        raise HTTPException(400, 'Old password is incorrect')
    current_admin.hashed_password = get_password_hash(new_password)
    db.commit()
    return {'status': 'success', 'message': 'Password changed'}


# ── All orders ───────────────────────────────────────────────────

@router.get('/orders')
def list_orders(
    db: Session = Depends(get_db),
    _: any = Depends(admin_required)
):
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    result = []
    for o in orders:
        user = db.query(User).filter(User.id == o.user_id).first()
        result.append({
            'id': str(o.id),
            'user_id': str(o.user_id),
            'customer_name': user.full_name if user else 'Unknown',
            'customer_email': user.email if user else '',
            'status': o.status,
            'subtotal': float(o.subtotal),
            'discount_amount': float(o.discount_amount),
            'delivery_charge': float(o.delivery_charge),
            'total_amount': float(o.total_amount),
            'payment_method': o.payment_method,
            'payment_status': o.payment_status,
            'payment_transaction_id': o.payment_transaction_id,
            'shipping_address': o.shipping_address,
            'notes': o.notes,
            'created_at': o.created_at.isoformat(),
            'items': [
                {
                    'id': str(i.id),
                    'product_id': str(i.product_id),
                    'quantity': float(i.quantity),
                    'unit_price': float(i.unit_price),
                    'total_price': float(i.total_price),
                    'product_snapshot': i.product_snapshot,
                }
                for i in o.items
            ]
        })
    return result


# ── Single order detail ──────────────────────────────────────────

@router.get('/orders/{order_id}')
def get_order_detail(
    order_id: str,
    db: Session = Depends(get_db),
    _: any = Depends(admin_required)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(404, 'Order not found')
    user = db.query(User).filter(User.id == order.user_id).first()
    return {
        'id': str(order.id),
        'customer_name': user.full_name if user else 'Unknown',
        'customer_email': user.email if user else '',
        'status': order.status,
        'subtotal': float(order.subtotal),
        'discount_amount': float(order.discount_amount),
        'delivery_charge': float(order.delivery_charge),
        'total_amount': float(order.total_amount),
        'payment_method': order.payment_method,
        'payment_status': order.payment_status,
        'payment_transaction_id': order.payment_transaction_id,
        'shipping_address': order.shipping_address,
        'notes': order.notes,
        'created_at': order.created_at.isoformat(),
        'items': [
            {
                'id': str(i.id),
                'product_id': str(i.product_id),
                'quantity': float(i.quantity),
                'unit_price': float(i.unit_price),
                'total_price': float(i.total_price),
                'product_snapshot': i.product_snapshot,
            }
            for i in order.items
        ]
    }


# ── Update order status ──────────────────────────────────────────

@router.put('/orders/{order_id}/status')
def update_order_status(
    order_id: str,
    status: str,
    db: Session = Depends(get_db),
    _: any = Depends(admin_required)
):
    valid = ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
    if status not in valid:
        raise HTTPException(400, f'Invalid status. Must be one of: {valid}')
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(404, 'Order not found')
    order.status = status
    order.updated_at = datetime.utcnow()
    db.commit()
    return {'status': 'updated', 'order_status': status}


# ── Update payment status ────────────────────────────────────────

@router.put('/orders/{order_id}/payment-status')
def update_payment_status(
    order_id: str,
    payment_status: str,
    transaction_id: str = None,
    db: Session = Depends(get_db),
    _: any = Depends(admin_required)
):
    valid = ('unpaid', 'paid', 'refunded')
    if payment_status not in valid:
        raise HTTPException(400, 'Invalid payment status')
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(404, 'Order not found')
    order.payment_status = payment_status
    if transaction_id:
        order.payment_transaction_id = transaction_id
    order.updated_at = datetime.utcnow()
    db.commit()
    return {'status': 'updated', 'payment_status': payment_status}


# ── Save memo/notes ──────────────────────────────────────────────

@router.put('/orders/{order_id}/notes')
def update_order_notes(
    order_id: str,
    notes: str,
    db: Session = Depends(get_db),
    _: any = Depends(admin_required)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(404, 'Order not found')
    order.notes = notes
    order.updated_at = datetime.utcnow()
    db.commit()
    return {'status': 'updated', 'notes': notes}


# ── Dashboard stats ──────────────────────────────────────────────

@router.get('/stats')
def get_stats(
    db: Session = Depends(get_db),
    _: any = Depends(admin_required)
):
    total_users = db.query(User).filter(
        User.status != 'deleted',
        User.role == 'customer'
    ).count()

    total_orders = db.query(Order).count()

    pending_orders = db.query(Order).filter(
        Order.status == 'pending'
    ).count()

    delivered_orders = db.query(Order).filter(
        Order.status == 'delivered'
    ).count()

    revenue_result = db.query(func.sum(Order.total_amount)).filter(
        Order.status == 'delivered',
        Order.payment_status == 'paid'
    ).scalar()
    total_revenue = float(revenue_result or 0)

    return {
        'total_users': total_users,
        'total_orders': total_orders,
        'pending_orders': pending_orders,
        'delivered_orders': delivered_orders,
        'total_revenue': total_revenue,
    }