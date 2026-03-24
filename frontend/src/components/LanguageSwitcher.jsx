import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const nextLang = i18n.language === 'en' ? 'bn' : 'en';
        i18n.changeLanguage(nextLang);
        localStorage.setItem('lang', nextLang);
    };

    return (
        <button onClick={toggleLanguage} className="text-sm px-3 py-1 border rounded-lg bg-white/80 hover:bg-white">
            {i18n.language === 'bn' ? '🇧🇩 বাং' : '🇬🇧 EN'}
        </button>
    );
};

export default LanguageSwitcher;
