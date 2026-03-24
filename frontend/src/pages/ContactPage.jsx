import { useTranslation } from 'react-i18next';
import { FaWhatsapp } from 'react-icons/fa';

const ContactPage = () => {
    const { t, i18n } = useTranslation();
    const isBn = i18n.language === 'bn';
    const number = import.meta.env.VITE_WHATSAPP_NUMBER || '8801XXXXXXXXX';
    const href = `https://wa.me/${number}?text=${encodeURIComponent(isBn ? 'হ্যালো BanglaCraft, সাহায্য দরকার' : 'Hello BanglaCraft, I need help')}`;

    return (
        <section className="space-y-6">
            <h1 className="text-3xl font-heading text-primary">{t('contact us')}</h1>
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold">{t('whatsapp support')}</h2>
                <p>{isBn ? 'হোয়াটসঅ্যাপ নম্বর: ' : 'WhatsApp number: '}+880 {number}</p>
                <p>{t('available hours')}</p>
                <a href={href} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-whatsapp text-white rounded-lg">
                    <FaWhatsapp /> {t('whatsapp us')}
                </a>
            </div>
        </section>
    );
};

export default ContactPage;
