import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t, i18n } = useTranslation();
    const isBn = i18n.language === 'bn';

    return (
        <footer className="bg-white border-t border-gray-200 py-8 mt-8">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <h6 className="font-heading text-lg text-primary">BanglaCraft</h6>
                    <p className="text-sm text-gray-600">{t('tagline', { defaultValue: 'Crafted with Heart, Rooted in Bangladesh' })}</p>
                </div>
                <div>
                    <h6 className="font-semibold">{t('whatsapp support')}</h6>
                    <p>{isBn ? 'হোয়াটসঅ্যাপ সাপোর্ট' : 'WhatsApp Support'}</p>
                    <p>+880 {import.meta.env.VITE_WHATSAPP_NUMBER || '1XXXXXXXXX'}</p>
                    <p>{t('available hours')}</p>
                </div>
                <div>
                    <h6 className="font-semibold">{t('contact us')}</h6>
                    <p>{isBn ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh'}</p>
                    <p>support@banglacraft.com</p>
                </div>
            </div>
            <div className="text-center text-sm text-gray-500 mt-6">© {new Date().getFullYear()} BanglaCraft. All rights reserved.</div>
        </footer>
    );
};

export default Footer;
