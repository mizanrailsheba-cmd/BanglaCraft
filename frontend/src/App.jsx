import { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ContactPage from './pages/ContactPage';
import AuthLayout from './components/AuthLayout';
import Header from './components/Header';
import Footer from './components/Footer';
import CartPage from './pages/CartPage';
import DashboardPage from './pages/user/DashboardPage';
import AdminPanelPage from './pages/admin/AdminPanelPage';
import WhatsAppButton from './components/WhatsAppButton';
import { useTranslation } from 'react-i18next';

function App() {
    const { i18n } = useTranslation();

    useEffect(() => {
        document.documentElement.lang = i18n.language;
        if (i18n.language === 'bn') {
            document.documentElement.classList.add('lang-bn');
            document.body.style.fontFamily = "'Hind Siliguri', 'Noto Sans Bengali', sans-serif";
        } else {
            document.documentElement.classList.remove('lang-bn');
            document.body.style.fontFamily = "Inter, sans-serif";
        }
        localStorage.setItem('lang', i18n.language);
    }, [i18n.language]);

    return (
        <div className="min-h-screen bg-background text-text">
            <Header />
            <div className="max-w-7xl mx-auto px-4 py-6">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:slug" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/dashboard/*" element={<DashboardPage />} />
                    <Route path="/admin/*" element={<AdminPanelPage />} />
                    <Route path="/login" element={<AuthLayout mode="login" />} />
                    <Route path="/register" element={<AuthLayout mode="register" />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
            <Footer />
            <WhatsAppButton />
        </div>
    );
}

export default App;
