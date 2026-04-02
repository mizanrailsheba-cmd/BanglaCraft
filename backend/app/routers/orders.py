from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..dependencies import get_db, get_current_user
from ..models.order import Order, OrderItem
from ..models.product import Product
from ..schemas.order import OrderCreate, OrderOut

router = APIRouter(prefix='/api/orders', tags=['orders'])


# ── Place Order ───────────────────────────────────────────────────
@router.post('/', response_model=OrderOut)
def place_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if not data.items:
        raise HTTPException(400, 'Order must have at least one item')

    subtotal = 0.0
    order_items = []

    for item in data.items:
        product = db.query(Product).filter(
            Product.id == str(item.product_id),
            Product.status == 'active',
            Product.is_approved == True
        ).first()

        if not product:
            raise HTTPException(404, f'Product not found: {item.product_id}')

        if product.stock_quantity < item.quantity:
            raise HTTPException(400, f'Insufficient stock for: {product.name_en}')

        price = float(product.sale_price) if product.sale_price else float(product.price)
        total = price * item.quantity
        subtotal += total

        order_items.append({
            'product': product,
            'quantity': item.quantity,
            'unit_price': price,
            'total_price': total,
            'snapshot': {
                'name': product.name_en,
                'name_bn': product.name_bn,
                'price': price,
                'image': product.images[0] if product.images else None,
                'slug': product.slug,
            }
        })

    delivery_charge = 0.0 if subtotal >= 1000 else 60.0
    discount_amount = 0.0
    total_amount = subtotal + delivery_charge - discount_amount

    order = Order(
        user_id=current_user.id,
        status='pending',
        subtotal=subtotal,
        discount_amount=discount_amount,
        delivery_charge=delivery_charge,
        total_amount=total_amount,
        payment_method=data.payment_method,
        payment_status='unpaid',
        shipping_address=data.shipping_address,
        notes=data.notes,
    )
    db.add(order)
    db.flush()

    for item_data in order_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data['product'].id,
            quantity=item_data['quantity'],
            unit_price=item_data['unit_price'],
            total_price=item_data['total_price'],
            product_snapshot=item_data['snapshot'],
        )
        db.add(order_item)

        # stock কমাও
        item_data['product'].stock_quantity -= item_data['quantity']

    db.commit()
    db.refresh(order)
    return order


# ── My Orders ─────────────────────────────────────────────────────
@router.get('/my', response_model=List[OrderOut])
def my_orders(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    orders = db.query(Order).filter(
        Order.user_id == current_user.id
    ).order_by(Order.created_at.desc()).all()
    return orders


# ── Order Detail ──────────────────────────────────────────────────
@router.get('/{order_id}', response_model=OrderOut)
def get_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    if not order:
        raise HTTPException(404, 'Order not found')
    return order


# ── Cancel Order ──────────────────────────────────────────────────
@router.put('/{order_id}/cancel')
def cancel_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    if not order:
        raise HTTPException(404, 'Order not found')
    if order.status not in ['pending', 'confirmed']:
        raise HTTPException(400, 'Order cannot be cancelled at this stage')

    order.status = 'cancelled'

    # stock ফিরিয়ে দাও
    for item in order.items:
        product = db.query(Product).filter(Product.id == str(item.product_id)).first()
        if product:
            product.stock_quantity += int(item.quantity)

    db.commit()
    return {'status': 'cancelled'}