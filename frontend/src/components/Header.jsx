import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiShoppingCart, FiUser, FiLogOut, FiGrid } from 'react-icons/fi';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Header = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    const userName = localStorage.getItem('user_name');

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    // Lock scroll when mobile menu open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_id');
        navigate('/login');
    };

    const cartCount = (() => {
        try {
            const items = JSON.parse(localStorage.getItem('cart') || '[]');
            return Array.isArray(items) ? items.reduce((n, i) => n + (i.qty || 1), 0) : 0;
        } catch { return 0; }
    })();

    const navLinkBase = 'relative px-1 py-1 text-sm font-medium transition-colors';
    const navLinkClass = ({ isActive }) =>
        `${navLinkBase} ${isActive
            ? 'text-primary after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-0.5 after:bg-primary after:rounded-full'
            : 'text-ink-soft hover:text-primary'}`;

    return (
        <>
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border-soft">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <span className="w-9 h-9 rounded-lg bg-brand-gradient text-white flex items-center justify-center font-heading font-bold shadow-glow group-hover:scale-105 transition-transform">
                            B
                        </span>
                        <span className="font-heading text-xl text-ink leading-none hidden sm:inline">
                            Bangla<span className="text-primary">Craft</span>
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden lg:flex items-center gap-7">
                        <NavLink to="/" end className={navLinkClass}>{t('home')}</NavLink>
                        <NavLink to="/products" className={navLinkClass}>{t('products')}</NavLink>
                        <NavLink to="/contact" className={navLinkClass}>{t('contact us')}</NavLink>
                        {token && role === 'admin' && (
                            <NavLink to="/admin" className={navLinkClass}>{t('admin panel')}</NavLink>
                        )}
                        {token && role === 'customer' && (
                            <NavLink to="/dashboard" className={navLinkClass}>{t('dashboard')}</NavLink>
                        )}
                    </nav>

                    {/* Right side */}
                    <div className="flex items-center gap-2 md:gap-3">
                        {/* Cart with badge */}
                        <Link
                            to="/cart"
                            aria-label={t('cart')}
                            className="relative inline-flex items-center justify-center w-10 h-10 rounded-full text-ink-soft hover:text-primary hover:bg-primary-50 transition-colors"
                        >
                            <FiShoppingCart className="text-xl" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>

                        <LanguageSwitcher />

                        {/* Auth */}
                        {token ? (
                            <div className="hidden md:flex items-center gap-2">
                                <span className="text-sm text-ink-soft truncate max-w-[120px]">
                                    {userName ? `Hi, ${userName.split(' ')[0]}` : 'Account'}
                                </span>
                                <button
                                    onClick={logout}
                                    className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-red-500 transition-colors px-2 py-1.5"
                                >
                                    <FiLogOut /> <span className="hidden xl:inline">{t('logout')}</span>
                                </button>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-2">
                                <Link to="/login" className="text-sm font-medium text-ink-soft hover:text-primary transition-colors px-2">
                                    {t('login')}
                                </Link>
                                <Link to="/register" className="btn-primary !py-2 !px-4 !text-sm">
                                    {t('register')}
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileOpen(v => !v)}
                            aria-label="Menu"
                            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-ink-soft hover:bg-border-soft transition-colors"
                        >
                            {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile drawer */}
            {mobileOpen && (
                <>
                    <div
                        className="lg:hidden fixed inset-0 bg-black/40 z-40 animate-fade-in"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="lg:hidden fixed top-16 left-0 right-0 bg-white z-40 border-b border-border-soft shadow-card animate-slide-down">
                        <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
                            {[
                                { to: '/', label: t('home') },
                                { to: '/products', label: t('products') },
                                { to: '/cart', label: t('cart') },
                                { to: '/contact', label: t('contact us') },
                            ].map(item => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.to === '/'}
                                    className={({ isActive }) =>
                                        `px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? 'bg-primary-50 text-primary'
                                            : 'text-ink-soft hover:bg-border-soft'}`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            ))}

                            <div className="h-px bg-border-soft my-2" />

                            {token ? (
                                <>
                                    {role === 'admin' && (
                                        <NavLink to="/admin" className="px-3 py-3 rounded-lg text-sm font-medium text-ink-soft hover:bg-border-soft inline-flex items-center gap-2">
                                            <FiGrid /> {t('admin panel')}
                                        </NavLink>
                                    )}
                                    {role === 'customer' && (
                                        <NavLink to="/dashboard" className="px-3 py-3 rounded-lg text-sm font-medium text-ink-soft hover:bg-border-soft inline-flex items-center gap-2">
                                            <FiUser /> {t('dashboard')}
                                        </NavLink>
                                    )}
                                    <button
                                        onClick={logout}
                                        className="text-left px-3 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 inline-flex items-center gap-2"
                                    >
                                        <FiLogOut /> {t('logout')}
                                    </button>
                                </>
                            ) : (
                                <div className="flex gap-2 mt-1">
                                    <Link to="/login" className="flex-1 btn-outline">{t('login')}</Link>
                                    <Link to="/register" className="flex-1 btn-primary">{t('register')}</Link>
                                </div>
                            )}
                        </nav>
                    </div>
                </>
            )}
        </>
    );
};

export default Header;
