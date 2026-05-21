import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';
import api from '../api/client';

const AuthLayout = ({ mode }) => {
    const { t, i18n } = useTranslation();
    const isBn = i18n.language === 'bn';
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const isLogin = mode === 'login';

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            if (isLogin) {
                const res = await api.post('/api/auth/login', { email, password });
                const { access_token, refresh_token, user } = res.data;

                localStorage.setItem('access_token', access_token);
                if (refresh_token) localStorage.setItem('refresh_token', refresh_token);

                if (user) {
                    localStorage.setItem('user_role', user.role);
                    localStorage.setItem('user_name', user.full_name);
                    localStorage.setItem('user_email', user.email);
                    localStorage.setItem('user_id', user.id);
                } else {
                    const payload = JSON.parse(atob(access_token.split('.')[1]));
                    localStorage.setItem('user_role', payload.role);
                }

                const role = localStorage.getItem('user_role');
                navigate(role === 'admin' ? '/admin' : '/dashboard');
            } else {
                await api.post('/api/auth/register', {
                    full_name: fullName,
                    email,
                    password,
                });
                navigate('/login');
            }
        } catch (err) {
            setMessage(err.response?.data?.detail || (isBn ? 'কিছু একটা ভুল হয়েছে' : 'Something went wrong'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="animate-fade-in -mx-4 -my-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-4rem)]">
                {/* ── Brand panel ── */}
                <div className="relative hidden lg:flex bg-brand-gradient text-white p-12 flex-col justify-between overflow-hidden">
                    {/* Decorative pattern */}
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }} />
                    <div className="relative">
                        <Link to="/" className="inline-flex items-center gap-2 mb-12">
                            <span className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center font-heading font-bold text-xl">
                                B
                            </span>
                            <span className="font-heading text-2xl">BanglaCraft</span>
                        </Link>
                        <h2 className="font-heading text-4xl xl:text-5xl leading-tight mb-4">
                            {isLogin
                                ? (isBn ? 'আবার স্বাগতম' : 'Welcome back')
                                : (isBn ? 'আমাদের সাথে যোগ দিন' : 'Join our craft community')}
                        </h2>
                        <p className="text-white/85 text-lg max-w-md leading-relaxed">
                            {isBn
                                ? 'বাংলাদেশের সেরা হস্তনির্মিত পণ্য আবিষ্কার করুন — কারিগরদের হাতে যত্নে তৈরি।'
                                : 'Discover the finest handcrafted goods from Bangladesh — made with care by skilled artisans.'}
                        </p>
                    </div>

                    <div className="relative space-y-3">
                        {[
                            { emoji: '🪡', label: isBn ? '১০০% হস্তনির্মিত' : '100% Handmade' },
                            { emoji: '🚚', label: isBn ? 'সারাদেশে ডেলিভারি' : 'Nationwide Delivery' },
                            { emoji: '💬', label: isBn ? '২৪/৭ হোয়াটসঅ্যাপ সাপোর্ট' : '24/7 WhatsApp Support' },
                        ].map(item => (
                            <div key={item.label} className="flex items-center gap-3 text-white/90">
                                <span className="text-2xl">{item.emoji}</span>
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Form panel ── */}
                <div className="flex items-center justify-center p-6 md:p-12 bg-background">
                    <div className="w-full max-w-md">
                        <div className="mb-8">
                            <h1 className="font-heading text-3xl text-ink mb-2">
                                {isLogin
                                    ? (isBn ? 'লগইন করুন' : 'Sign in to your account')
                                    : (isBn ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create your account')}
                            </h1>
                            <p className="text-ink-muted text-sm">
                                {isLogin
                                    ? (isBn ? 'অ্যাকাউন্ট নেই?' : "Don't have an account?")
                                    : (isBn ? 'ইতিমধ্যে অ্যাকাউন্ট আছে?' : 'Already have an account?')}{' '}
                                <Link to={isLogin ? '/register' : '/login'} className="text-primary font-semibold hover:underline">
                                    {isLogin ? t('register') : t('login')}
                                </Link>
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            {!isLogin && (
                                <div>
                                    <label className="label">{isBn ? 'পুরো নাম' : 'Full name'}</label>
                                    <div className="relative">
                                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                                        <input
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder={isBn ? 'আপনার নাম' : 'Your name'}
                                            required
                                            className="input !pl-10"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="label">{isBn ? 'ইমেইল' : 'Email'}</label>
                                <div className="relative">
                                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                                    <input
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        type="email"
                                        placeholder="you@email.com"
                                        required
                                        className="input !pl-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label className="label">{isBn ? 'পাসওয়ার্ড' : 'Password'}</label>
                                    {isLogin && (
                                        <button type="button" className="text-xs text-primary hover:underline mb-1.5">
                                            {isBn ? 'ভুলে গেছেন?' : 'Forgot?'}
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                                    <input
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        required
                                        minLength={isLogin ? 1 : 6}
                                        className="input !pl-10 !pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        aria-label="Toggle password visibility"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-primary"
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                                {!isLogin && (
                                    <p className="text-xs text-ink-muted mt-1.5">
                                        {isBn ? 'কমপক্ষে ৬টি অক্ষর হতে হবে' : 'Use at least 6 characters'}
                                    </p>
                                )}
                            </div>

                            {message && (
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                                    <FiAlertCircle className="mt-0.5 flex-shrink-0" />
                                    <span>{message}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full !py-3 text-base"
                            >
                                {loading
                                    ? (isLogin ? (isBn ? 'লগইন হচ্ছে...' : 'Signing in...') : (isBn ? 'নিবন্ধন হচ্ছে...' : 'Creating account...'))
                                    : (isLogin ? t('login') : t('register'))}
                            </button>
                        </form>

                        <p className="text-center text-xs text-ink-muted mt-8">
                            {isBn ? 'দ্বারা সুরক্ষিত' : 'Secured by'}{' '}
                            <span className="font-semibold text-ink-soft">BanglaCraft</span>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AuthLayout;
