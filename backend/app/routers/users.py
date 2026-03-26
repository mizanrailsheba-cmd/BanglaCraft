from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..dependencies import get_db, get_current_user
from ..models.user import User
from ..models.order import Order, OrderItem
from ..models.cart_item import CartItem

router = APIRouter(prefix='/api/user', tags=['user'])


# ── Cart — Get my cart ───────────────────────────────────────────

@router.get('/cart')
def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    result = []
    for item in items:
        from ..models.product import Product
        product = db.query(Product).filter(Product.id == item.product_id).first()
        result.append({
            'id': str(item.id),
            'product_id': str(item.product_id),
            'quantity': item.quantity,
            'added_at': item.added_at.isoformat(),
            'product': {
                'name': product.name if product else 'Unknown',
                'price': float(product.price) if product else 0,
                'image_url': getattr(product, 'image_url', None),
                'slug': getattr(product, 'slug', None),
            } if product else None
        })
    return result


# ── Cart — Add item ──────────────────────────────────────────────

@router.post('/cart')
def add_to_cart(
    product_id: str,
    quantity: int = 1,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == product_id
    ).first()

    if existing:
        existing.quantity += quantity
        db.commit()
        db.refresh(existing)
        return {'status': 'updated', 'id': str(existing.id), 'quantity': existing.quantity}

    item = CartItem(
        user_id=current_user.id,
        product_id=product_id,
        quantity=quantity,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {'status': 'added', 'id': str(item.id), 'quantity': item.quantity}


# ── Cart — Update quantity ───────────────────────────────────────

@router.put('/cart/{item_id}')
def update_cart_item(
    item_id: str,
    quantity: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(404, 'Cart item not found')
    if quantity <= 0:
        db.delete(item)
        db.commit()
        return {'status': 'removed'}
    item.quantity = quantity
    db.commit()
    return {'status': 'updated', 'quantity': quantity}


# ── Cart — Remove item ───────────────────────────────────────────

@router.delete('/cart/{item_id}')
def remove_cart_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(404, 'Cart item not found')
    db.delete(item)
    db.commit()
    return {'status': 'removed'}


# ── Cart — Clear entire cart ─────────────────────────────────────

@router.delete('/cart')
def clear_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    return {'status': 'cleared'}


# ── Orders — My orders ───────────────────────────────────────────

@router.get('/orders')
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    orders = db.query(Order).filter(
        Order.user_id == current_user.id
    ).order_by(Order.created_at.desc()).all()

    return [
        {
            'id': str(o.id),
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
                    'quantity': float(i.quantity),
                    'unit_price': float(i.unit_price),
                    'total_price': float(i.total_price),
                    'product_snapshot': i.product_snapshot,
                }
                for i in o.items
            ]
        }
        for o in orders
    ]


# ── Orders — Place order from cart ───────────────────────────────

@router.post('/orders')
def place_order(
    payment_method: str,
    shipping_address: dict,
    notes: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    valid_payments = ('sslcommerz', 'bkash', 'cod')
    if payment_method not in valid_payments:
        raise HTTPException(400, f'Payment method must be one of: {valid_payments}')

    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    if not cart_items:
        raise HTTPException(400, 'Cart is empty')

    from ..models.product import Product

    order_items = []
    subtotal = 0

    for cart_item in cart_items:
        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
        if not product:
            continue
        unit_price = float(product.price)
        qty = int(cart_item.quantity)
        total_price = unit_price * qty
        subtotal += total_price
        order_items.append(OrderItem(
            product_id=cart_item.product_id,
            quantity=qty,
            unit_price=unit_price,
            total_price=total_price,
            product_snapshot={
                'name': product.name,
                'price': unit_price,
                'image_url': getattr(product, 'image_url', None),
                'slug': getattr(product, 'slug', None),
            }
        ))

    if not order_items:
        raise HTTPException(400, 'No valid products in cart')

    delivery_charge = 60.0
    total_amount = subtotal + delivery_charge

    order = Order(
        user_id=current_user.id,
        status='pending',
        subtotal=subtotal,
        discount_amount=0,
        delivery_charge=delivery_charge,
        total_amount=total_amount,
        payment_method=payment_method,
        payment_status='unpaid',
        shipping_address=shipping_address,
        notes=notes,
    )
    order.items = order_items
    db.add(order)
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    db.refresh(order)

    return {
        'status': 'success',
        'order_id': str(order.id),
        'total_amount': float(order.total_amount),
        'payment_method': order.payment_method,
    }


# ── Orders — Cancel pending order ────────────────────────────────

@router.put('/orders/{order_id}/cancel')
def cancel_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    if not order:
        raise HTTPException(404, 'Order not found')
    if order.status != 'pending':
        raise HTTPException(400, 'Only pending orders can be cancelled')
    order.status = 'cancelled'
    order.updated_at = datetime.utcnow()
    db.commit()
    return {'status': 'cancelled'}


# ── Payment verify — bKash / Nagad ───────────────────────────────

@router.post('/orders/{order_id}/verify-payment')
def verify_payment(
    order_id: str,
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    if not order:
        raise HTTPException(404, 'Order not found')
    if order.payment_status == 'paid':
        raise HTTPException(400, 'Order already paid')

    order.payment_transaction_id = transaction_id
    order.notes = (order.notes or '') + f' | TXN submitted: {transaction_id}'
    order.updated_at = datetime.utcnow()
    db.commit()

    return {
        'status': 'submitted',
        'message': 'Transaction ID submitted. Admin will verify and confirm your order.',
        'order_id': order_id,
        'transaction_id': transaction_id,
    }