import api from './client';

// Stats
export const getStats = () =>
    api.get('/api/admin/stats');

// Users
export const getUsers = () =>
    api.get('/api/admin/users');

export const createUser = (params) =>
    api.post('/api/admin/users', null, { params });

export const deleteUser = (userId) =>
    api.delete(`/api/admin/users/${userId}`);

export const updateUserStatus = (userId, status, days = 0) =>
    api.put(`/api/admin/users/${userId}/status`, null, {
        params: { status, days }
    });

export const updateUserRole = (userId, role) =>
    api.put(`/api/admin/users/${userId}/role`, null, {
        params: { role }
    });

export const adminChangePassword = (old_password, new_password) =>
    api.post('/api/admin/change-password', null, {
        params: { old_password, new_password }
    });

// Orders
export const getOrders = () =>
    api.get('/api/admin/orders');

export const getOrderDetail = (orderId) =>
    api.get(`/api/admin/orders/${orderId}`);

export const updateOrderStatus = (orderId, status) =>
    api.put(`/api/admin/orders/${orderId}/status`, null, {
        params: { status }
    });

export const updatePaymentStatus = (orderId, payment_status, transaction_id = null) =>
    api.put(`/api/admin/orders/${orderId}/payment-status`, null, {
        params: { payment_status, ...(transaction_id && { transaction_id }) }
    });

export const updateOrderNotes = (orderId, notes) =>
    api.put(`/api/admin/orders/${orderId}/notes`, null, {
        params: { notes }
    });

// Products
export const getAdminProducts = () =>
    api.get('/api/products/admin/all');

export const createProduct = (formData) =>
    api.post('/api/products/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });

export const updateProduct = (productId, formData) =>
    api.put(`/api/products/${productId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });

export const deleteProduct = (productId) =>
    api.delete(`/api/products/${productId}`);

export const approveProduct = (productId) =>
    api.put(`/api/products/admin/${productId}/approve`);

// Categories
export const getCategories = () =>
    api.get('/api/categories/');