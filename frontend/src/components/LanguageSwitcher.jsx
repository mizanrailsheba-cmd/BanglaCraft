import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const isBn = i18n.language === 'bn';

    const toggleLanguage = () => {
        const nextLang = isBn ? 'en' : 'bn';
        i18n.changeLanguage(nextLang);
        localStorage.setItem('lang', nextLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            aria-label="Toggle language"
            title={isBn ? 'Switch to English' : 'বাংলায় দেখুন'}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 h-9 rounded-full border border-border bg-white text-ink-soft hover:border-primary hover:text-primary transition-colors"
        >
            <span className="text-base leading-none">{isBn ? '🇧🇩' : '🇬🇧'}</span>
            <span className="leading-none">{isBn ? 'বাং' : 'EN'}</span>
        </button>
    );
};

export default LanguageSwitcher;
