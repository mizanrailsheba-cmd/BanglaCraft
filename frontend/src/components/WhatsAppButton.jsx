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
    const encoded = encodeURIComponent(msg);
    const href = `https://wa.me/${number}?text=${encoded}`;

    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            title={t('chat with us')}
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-whatsapp shadow-[0_4px_12px_rgba(37,211,102,0.4)] flex items-center justify-center text-white text-2xl transform transition hover:scale-110"
        >
            <FaWhatsapp />
        </a>
    );
};

export default WhatsAppButton;
