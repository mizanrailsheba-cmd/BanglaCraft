import api from './client';

// Cart
export const getCart = () =>
    api.get('/api/user/cart');

export const addToCart = (product_id, quantity = 1) =>
    api.post('/api/user/cart', null, {
        params: { product_id, quantity }
    });

export const updateCartItem = (itemId, quantity) =>
    api.put(`/api/user/cart/${itemId}`, null, {
        params: { quantity }
    });

export const removeCartItem = (itemId) =>
    api.delete(`/api/user/cart/${itemId}`);

export const clearCart = () =>
    api.delete('/api/user/cart');

// Orders
export const getMyOrders = () =>
    api.get('/api/user/orders');

export const placeOrder = (payment_method, shipping_address, notes = null) =>
    api.post('/api/user/orders', shipping_address, {
        params: {
            payment_method,
            ...(notes && { notes })
        }
    });

export const cancelOrder = (orderId) =>
    api.put(`/api/user/orders/${orderId}/cancel`);

export const verifyPayment = (orderId, transaction_id) =>
    api.post(`/api/user/orders/${orderId}/verify-payment`, null, {
        params: { transaction_id }
    });