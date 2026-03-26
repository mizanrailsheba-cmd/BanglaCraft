import api from './client';

export const login = (email, password) =>
    api.post('/api/auth/login', { email, password });

export const register = (data) =>
    api.post('/api/auth/register', data);

export const getMe = () =>
    api.get('/api/auth/me');

export const changePassword = (old_password, new_password) =>
    api.post('/api/auth/change-password', null, {
        params: { old_password, new_password }
    });

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_id');
};