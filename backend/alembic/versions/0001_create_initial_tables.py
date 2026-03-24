"""create initial tables

Revision ID: 0001
Revises: 
Create Date: 2026-01-01 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0001'
down_revision = None
branch_labels = None
def upgrade():
    op.execute("CREATE TYPE user_roles AS ENUM ('customer','seller','admin')")
    op.execute("CREATE TYPE user_statuses AS ENUM ('pending','active','suspended','deleted')")
    op.execute("CREATE TYPE preferred_language AS ENUM ('en','bn')")
    op.execute("CREATE TYPE product_status AS ENUM ('draft','active','archived')")
    op.execute("CREATE TYPE order_status AS ENUM ('pending','confirmed','processing','shipped','delivered','cancelled')")
    op.execute("CREATE TYPE payment_methods AS ENUM ('sslcommerz','bkash','cod')")
    op.execute("CREATE TYPE payment_status AS ENUM ('unpaid','paid','refunded')")
    op.execute("CREATE TYPE payment_status_all AS ENUM ('pending','success','failed','cancelled','refunded')")
    op.execute("CREATE TYPE voucher_type AS ENUM ('percentage','fixed')")

    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('phone', sa.String(32), nullable=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('role', sa.Enum('customer','seller','admin', name='user_roles'), nullable=False, server_default='customer'),
        sa.Column('status', sa.Enum('pending','active','suspended','deleted', name='user_statuses'), nullable=False, server_default='pending'),
        sa.Column('suspension_until', sa.DateTime, nullable=True),
        sa.Column('avatar_url', sa.String(1024), nullable=True),
        sa.Column('preferred_language', sa.Enum('en','bn', name='preferred_language'), nullable=False, server_default='en'),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_table(
        'categories',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name_en', sa.String(255), nullable=False),
        sa.Column('name_bn', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(255), unique=True, nullable=False),
        sa.Column('parent_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('categories.id'), nullable=True),
        sa.Column('image_url', sa.String(1024), nullable=True),
    )
    op.create_table(
        'products',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('seller_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('name_en', sa.String(255), nullable=False),
        sa.Column('name_bn', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(255), unique=True, nullable=False),
        sa.Column('description_en', sa.String, nullable=False),
        sa.Column('description_bn', sa.String, nullable=False),
        sa.Column('sku', sa.String(128), nullable=True),
        sa.Column('price', sa.Numeric(10,2), nullable=False),
        sa.Column('sale_price', sa.Numeric(10,2), nullable=True),
        sa.Column('stock_quantity', sa.Integer, nullable=False, server_default='0'),
        sa.Column('category_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('categories.id'), nullable=False),
        sa.Column('images', postgresql.ARRAY(sa.String), nullable=True),
        sa.Column('tags', postgresql.ARRAY(sa.String), nullable=True),
        sa.Column('status', sa.Enum('draft','active','archived', name='product_status'), nullable=False, server_default='draft'),
        sa.Column('is_approved', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_table(
        'cart_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('product_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('products.id'), nullable=False),
        sa.Column('quantity', sa.Integer, nullable=False, server_default='1'),
        sa.Column('added_at', sa.DateTime, server_default=sa.func.now(), nullable=False),
    )
    op.create_table(
        'orders',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('status', sa.Enum('pending','confirmed','processing','shipped','delivered','cancelled', name='order_status'), nullable=False, server_default='pending'),
        sa.Column('subtotal', sa.Numeric(10,2), nullable=False, server_default='0'),
        sa.Column('discount_amount', sa.Numeric(10,2), nullable=False, server_default='0'),
        sa.Column('delivery_charge', sa.Numeric(10,2), nullable=False, server_default='0'),
        sa.Column('total_amount', sa.Numeric(10,2), nullable=False, server_default='0'),
        sa.Column('payment_method', sa.Enum('sslcommerz','bkash','cod', name='payment_methods'), nullable=False, server_default='cod'),
        sa.Column('payment_status', sa.Enum('unpaid','paid','refunded', name='payment_status'), nullable=False, server_default='unpaid'),
        sa.Column('payment_transaction_id', sa.String(255), nullable=True),
        sa.Column('shipping_address', postgresql.JSON, nullable=False),
        sa.Column('notes', sa.String, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_table(
        'order_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('order_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('orders.id'), nullable=False),
        sa.Column('product_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('products.id'), nullable=False),
        sa.Column('quantity', sa.Integer, nullable=False, server_default='1'),
        sa.Column('unit_price', sa.Numeric(10,2), nullable=False),
        sa.Column('total_price', sa.Numeric(10,2), nullable=False),
        sa.Column('product_snapshot', postgresql.JSON, nullable=False),
    )
    op.create_table(
        'vouchers',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('code', sa.String(64), unique=True, nullable=False),
        sa.Column('type', sa.Enum('percentage','fixed', name='voucher_type'), nullable=False),
        sa.Column('value', sa.Numeric(10,2), nullable=False),
        sa.Column('min_order_amount', sa.Numeric(10,2), nullable=False, server_default='0'),
        sa.Column('max_uses', sa.Integer, nullable=True),
        sa.Column('used_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('valid_from', sa.DateTime, nullable=False),
        sa.Column('valid_until', sa.DateTime, nullable=False),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
    )
    op.create_table(
        'invoices',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('order_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('orders.id'), nullable=False),
        sa.Column('invoice_number', sa.String(64), unique=True, nullable=False),
        sa.Column('issued_at', sa.DateTime, nullable=False),
        sa.Column('pdf_url', sa.String(1024), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
    )
    op.create_table(
        'payments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('order_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('orders.id'), nullable=False),
        sa.Column('method', sa.Enum('sslcommerz','bkash','cod', name='payment_method'), nullable=False),
        sa.Column('transaction_id', sa.String(255), nullable=True),
        sa.Column('amount', sa.Numeric(10,2), nullable=False),
        sa.Column('currency', sa.String(8), nullable=False, server_default='BDT'),
        sa.Column('status', sa.Enum('pending','success','failed','cancelled','refunded', name='payment_status_all'), nullable=False, server_default='pending'),
        sa.Column('gateway_response', postgresql.JSON, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_table(
        'site_settings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('key', sa.String(128), unique=True, nullable=False),
        sa.Column('value', sa.String(1024), nullable=False),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    op.create_table(
        'refresh_tokens',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('token_hash', sa.String(255), nullable=False, unique=True),
        sa.Column('expires_at', sa.DateTime, nullable=False),
        sa.Column('revoked', sa.Boolean, nullable=False, server_default='false'),
    )

def downgrade():
    op.drop_table('refresh_tokens')
    op.drop_table('site_settings')
    op.drop_table('payments')
    op.drop_table('invoices')
    op.drop_table('vouchers')
    op.drop_table('order_items')
    op.drop_table('orders')
    op.drop_table('cart_items')
    op.drop_table('products')
    op.drop_table('categories')
    op.drop_table('users')
    op.execute('DROP TYPE IF EXISTS user_roles')
    op.execute('DROP TYPE IF EXISTS user_statuses')
    op.execute('DROP TYPE IF EXISTS preferred_language')
    op.execute('DROP TYPE IF EXISTS product_status')
    op.execute('DROP TYPE IF EXISTS order_status')
    op.execute('DROP TYPE IF EXISTS payment_methods')
    op.execute('DROP TYPE IF EXISTS payment_status')
    op.execute('DROP TYPE IF EXISTS payment_status_all')
    op.execute('DROP TYPE IF EXISTS voucher_type')
