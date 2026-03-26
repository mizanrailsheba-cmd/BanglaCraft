import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/client';

const AuthLayout = ({ mode }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            if (mode === 'login') {
                const res = await api.post('/api/auth/login', { email, password });
                const { access_token, refresh_token, user } = res.data;

                // Token save
                localStorage.setItem('access_token', access_token);
                if (refresh_token) localStorage.setItem('refresh_token', refresh_token);

                // User info save — DashboardPage ও AdminPanelPage এ use হবে
                if (user) {
                    localStorage.setItem('user_role', user.role);
                    localStorage.setItem('user_name', user.full_name);
                    localStorage.setItem('user_email', user.email);
                    localStorage.setItem('user_id', user.id);
                } else {
                    // fallback: JWT থেকে role নেওয়া (পুরোনো পদ্ধতি)
                    const payload = JSON.parse(atob(access_token.split('.')[1]));
                    localStorage.setItem('user_role', payload.role);
                }

                const role = localStorage.getItem('user_role');
                if (role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            } else {
                await api.post('/api/auth/register', {
                    full_name: fullName,
                    email,
                    password,
                });
                setMessage(t('registered successfully, please login'));
                navigate('/login');
            }
        } catch (err) {
            setMessage(err.response?.data?.detail || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="max-w-md mx-auto bg-white p-6 rounded-xl shadow mt-10">
            <h1 className="text-2xl font-heading mb-6 text-primary">
                {mode === 'login' ? t('login') : t('register')}
            </h1>
            <form onSubmit={submit} className="space-y-4">
                {mode === 'register' && (
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">{t('full name', 'Full Name')}</label>
                        <input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder={t('full name', 'Full Name')}
                            required
                            className="w-full border border-border px-3 py-2 rounded-lg text-sm"
                        />
                    </div>
                )}
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Email</label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="you@email.com"
                        required
                        className="w-full border border-border px-3 py-2 rounded-lg text-sm"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Password</label>
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        placeholder="••••••••"
                        required
                        className="w-full border border-border px-3 py-2 rounded-lg text-sm"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
                >
                    {loading
                        ? (mode === 'login' ? 'Logging in...' : 'Registering...')
                        : (mode === 'login' ? t('login') : t('register'))
                    }
                </button>
            </form>

            {message && (
                <p className="mt-3 text-sm text-red-500">{message}</p>
            )}

            <p className="mt-4 text-center text-sm text-gray-500">
                {mode === 'login' ? (
                    <>Don't have an account?{' '}
                        <Link to="/register" className="text-primary font-medium hover:underline">Register</Link>
                    </>
                ) : (
                    <>Already have an account?{' '}
                        <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
                    </>
                )}
            </p>
        </section>
    );
};

export default AuthLayout;