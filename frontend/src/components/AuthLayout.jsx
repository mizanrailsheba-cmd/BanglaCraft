import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';

const AuthLayout = ({ mode }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [message, setMessage] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'login') {
                const res = await api.post('/api/auth/login', { email, password });
                localStorage.setItem('access_token', res.data.access_token);
                navigate('/dashboard');
            } else {
                await api.post('/api/auth/register', { full_name: fullName, email, password });
                setMessage(t('order placed', 'Registered successfully, please login'));
                navigate('/login');
            }
        } catch (err) {
            setMessage(err.response?.data?.detail || 'Error');
        }
    };

    return (
        <section className="max-w-md mx-auto bg-white p-6 rounded-xl shadow mt-10">
            <h1 className="text-2xl font-heading mb-4">{mode === 'login' ? t('login') : t('register')}</h1>
            <form onSubmit={submit} className="space-y-4">
                {mode === 'register' && (
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t('full name', 'Full Name')} required className="w-full border px-3 py-2 rounded" />
                )}
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" required className="w-full border px-3 py-2 rounded" />
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" required className="w-full border px-3 py-2 rounded" />
                <button type="submit" className="w-full py-2 bg-secondary text-white rounded-lg">{mode === 'login' ? t('login') : t('register')}</button>
            </form>
            {message && <p className="mt-3 text-red-500">{message}</p>}
        </section>
    );
};

export default AuthLayout;
