import { FaWhatsapp } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const WhatsAppProductBtn = ({ product }) => {
    const { t, i18n } = useTranslation();
    const number = import.meta.env.VITE_WHATSAPP_NUMBER || '8801XXXXXXXXX';

    const name = i18n.language === 'bn' ? product.name_bn : product.name_en;
    const message = i18n.language === 'bn'
        ? `হ্যালো BanglaCraft, আমি এই পণ্যটিতে আগ্রহী: ${name}`
        : `Hello BanglaCraft, I'm interested in: ${name}`;

    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

    return (
        <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 border border-whatsapp text-whatsapp rounded-lg hover:bg-whatsapp hover:text-white transition">
            <FaWhatsapp />
            {t('ask on whatsapp')}
        </a>
    );
};

export default WhatsAppProductBtn;
