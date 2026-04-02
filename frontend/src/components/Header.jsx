import { Link, NavLink, useNavigate } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Header = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_name');
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center gap-4">
                <Link to="/" className="text-primary font-bold text-2xl flex items-center gap-2">
                    <span>BanglaCraft</span>
                    <span className="text-xl">🪢</span>
                </Link>

                <nav className="flex items-center gap-3">
                    <NavLink to="/" end className={({ isActive }) => isActive ? 'font-semibold text-secondary' : 'text-gray-700'}>{t('home')}</NavLink>
                    <NavLink to="/products" className={({ isActive }) => isActive ? 'font-semibold text-secondary' : 'text-gray-700'}>{t('products')}</NavLink>
                    <NavLink to="/cart" className={({ isActive }) => isActive ? 'font-semibold text-secondary' : 'text-gray-700'}>{t('cart')}</NavLink>
                    <NavLink to="/contact" className={({ isActive }) => isActive ? 'font-semibold text-secondary' : 'text-gray-700'}>{t('contact us')}</NavLink>

                    {token ? (
                        <>
                            {role === 'admin' && (
                                <NavLink to="/admin"
                                    className={({ isActive }) => isActive
                                        ? 'font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-lg'
                                        : 'text-purple-600 bg-purple-50 px-3 py-1 rounded-lg hover:bg-purple-100 transition-colors'
                                    }>
                                    Admin Panel
                                </NavLink>
                            )}
                            {role === 'customer' && (
                                <NavLink to="/dashboard"
                                    className={({ isActive }) => isActive
                                        ? 'font-semibold text-secondary'
                                        : 'text-gray-700'
                                    }>
                                    Dashboard
                                </NavLink>
                            )}
                            <button onClick={logout} className="text-red-500">{t('logout')}</button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className="text-gray-700">{t('login')}</NavLink>
                            <NavLink to="/register" className="text-gray-700">{t('register')}</NavLink>
                        </>
                    )}
                    <LanguageSwitcher />
                </nav>
            </div>
        </header>
    );
};

export default Header;