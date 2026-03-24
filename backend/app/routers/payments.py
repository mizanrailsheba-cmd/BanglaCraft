from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..dependencies import get_db, get_current_user
from ..models.payment import Payment
from ..models.order import Order
from ..schemas.payment import PaymentIn, PaymentOut
from ..schemas.order import OrderOut

router = APIRouter(prefix='/api/payments', tags=['payments'])


@router.post('/sslcommerz/initiate')
def sslcommerz_initiate(payload: PaymentIn, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == payload.order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Order not found')
    payment = Payment(order_id=order.id, method='sslcommerz', amount=payload.amount, status='pending', currency='BDT')
    db.add(payment)
    db.commit()
    db.refresh(payment)
    # In real integration, call SSLCommerz API here
    return {'payment_url': f'https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?trnx_id={payment.id}'}


@router.post('/sslcommerz/success')
def sslcommerz_success(order_id: str, transaction_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Order not found')
    order.payment_status = 'paid'
    order.status = 'confirmed'
    order.payment_transaction_id = transaction_id
    payment = Payment(order_id=order.id, method='sslcommerz', transaction_id=transaction_id, amount=order.total_amount, status='success')
    db.add(order)
    db.add(payment)
    db.commit()
    return {'status': 'paid'}


@router.post('/sslcommerz/fail')
def sslcommerz_fail(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Order not found')
    order.payment_status = 'unpaid'
    order.status = 'cancelled'
    db.add(order)
    db.commit()
    return {'status': 'failed'}


@router.post('/sslcommerz/cancel')
def sslcommerz_cancel(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Order not found')
    order.payment_status = 'unpaid'
    order.status = 'cancelled'
    db.add(order)
    db.commit()
    return {'status': 'cancelled'}


@router.post('/sslcommerz/ipn')
def sslcommerz_ipn(order_id: str, status: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Order not found')
    order.payment_status = 'paid' if status == 'VALID' else 'failed'
    db.add(order)
    db.commit()
    return {'status': 'ok'}


@router.post('/bkash/create')
def bkash_create(payload: PaymentIn, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == payload.order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Order not found')
    payment = Payment(order_id=order.id, method='bkash', amount=payload.amount, status='pending', currency='BDT')
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return {'bkash_url': f'https://sandbox.bkash.com/checkout/{payment.id}', 'payment_id': str(payment.id)}


@router.post('/bkash/execute')
def bkash_execute(payment_id: str, transaction_id: str, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id, Payment.method == 'bkash').first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Payment not found')
    payment.status = 'success'
    payment.transaction_id = transaction_id
    db.add(payment)
    db.commit()
    order = db.query(Order).filter(Order.id == payment.order_id).first()
    if order:
        order.payment_status = 'paid'
        order.status = 'confirmed'
        order.payment_transaction_id = transaction_id
        db.add(order)
        db.commit()
    return {'status': 'paid'}


@router.post('/bkash/callback')
def bkash_callback(order_id: str, status: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Order not found')
    if status == 'success':
        order.payment_status = 'paid'
        order.status = 'confirmed'
        db.add(order)
        db.commit()
    else:
        order.payment_status = 'failed'
        order.status = 'cancelled'
        db.add(order)
        db.commit()
    return {'status': status}


@router.post('/bkash/refund/{payment_id}')
def bkash_refund(payment_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    payment = db.query(Payment).filter(Payment.id == payment_id, Payment.method == 'bkash').first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Payment not found')
    payment.status = 'refunded'
    db.add(payment)
    db.commit()
    order = db.query(Order).filter(Order.id == payment.order_id).first()
    if order:
        order.payment_status = 'refunded'
        db.add(order)
        db.commit()
    return {'status': 'refunded'}
