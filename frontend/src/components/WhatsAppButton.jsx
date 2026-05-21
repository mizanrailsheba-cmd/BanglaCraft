import { FaWhatsapp } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const WhatsAppButton = () => {
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const number = import.meta.env.VITE_WHATSAPP_NUMBER || '8801XXXXXXXXX';

    if (location.pathname.startsWith('/admin')) return null;

    const msg = i18n.language === 'bn'
        ? 'হ্যালো BanglaCraft, আমার সাহায্য দরকার'
        : 'Hello BanglaCraft, I need help';
    const href = `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;

    return (
        <div className="fixed bottom-6 right-6 z-50 group">
            {/* Tooltip */}
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-ink text-white text-xs px-3 py-1.5 rounded-lg shadow-lift opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {t('chat with us')}
                <span className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-ink rotate-45" />
            </span>

            {/* Pulse rings */}
            <span className="absolute inset-0 rounded-full bg-whatsapp animate-pulse-ring" aria-hidden />
            <span className="absolute inset-0 rounded-full bg-whatsapp animate-pulse-ring" style={{ animationDelay: '0.6s' }} aria-hidden />

            <a
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={t('chat with us')}
                className="relative h-14 w-14 rounded-full bg-whatsapp shadow-[0_6px_20px_rgba(37,211,102,0.45)] flex items-center justify-center text-white text-2xl transform transition hover:scale-110"
            >
                <FaWhatsapp />
            </a>
        </div>
    );
};

export default WhatsAppButton;
