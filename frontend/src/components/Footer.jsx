import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaYoutube } from 'react-icons/fa';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
    const { t, i18n } = useTranslation();
    const isBn = i18n.language === 'bn';
    const number = import.meta.env.VITE_WHATSAPP_NUMBER || '8801XXXXXXXXX';

    return (
        <footer className="mt-16 bg-white border-t border-border-soft">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">

                {/* Brand */}
                <div className="col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-9 h-9 rounded-lg bg-brand-gradient text-white flex items-center justify-center font-heading font-bold shadow-glow">
                            B
                        </span>
                        <span className="font-heading text-xl text-ink">
                            Bangla<span className="text-primary">Craft</span>
                        </span>
                    </div>
                    <p className="text-sm text-ink-muted leading-relaxed mb-4">
                        {t('tagline', { defaultValue: 'Crafted with heart, rooted in Bangladesh — handmade textiles and crafts from skilled artisans.' })}
                    </p>
                    <div className="flex gap-2">
                        {[
                            { Icon: FaFacebookF, href: '#', label: 'Facebook' },
                            { Icon: FaInstagram, href: '#', label: 'Instagram' },
                            { Icon: FaWhatsapp, href: `https://wa.me/${number}`, label: 'WhatsApp' },
                            { Icon: FaYoutube, href: '#', label: 'YouTube' },
                        ].map(({ Icon, href, label }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={label}
                                className="w-9 h-9 rounded-full bg-border-soft text-ink-soft flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                            >
                                <Icon className="text-sm" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Shop */}
                <div>
                    <h6 className="font-semibold text-ink mb-4 text-sm uppercase tracking-wider">
                        {isBn ? 'কেনাকাটা' : 'Shop'}
                    </h6>
                    <ul className="space-y-2 text-sm">
                        {[
                            { to: '/products', label: t('products') },
                            { to: '/products?category=textile', label: isBn ? 'কাপড়' : 'Textile' },
                            { to: '/products?category=jewelry', label: isBn ? 'গহনা' : 'Jewelry' },
                            { to: '/products?category=handicrafts', label: isBn ? 'হস্তশিল্প' : 'Handicraft' },
                        ].map(item => (
                            <li key={item.to}>
                                <Link to={item.to} className="text-ink-muted hover:text-primary transition-colors">
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Support */}
                <div>
                    <h6 className="font-semibold text-ink mb-4 text-sm uppercase tracking-wider">
                        {isBn ? 'সহায়তা' : 'Support'}
                    </h6>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/contact" className="text-ink-muted hover:text-primary transition-colors">{t('contact us')}</Link></li>
                        <li><span className="text-ink-muted">{isBn ? 'শিপিং তথ্য' : 'Shipping Info'}</span></li>
                        <li><span className="text-ink-muted">{isBn ? 'রিটার্ন নীতি' : 'Returns Policy'}</span></li>
                        <li><span className="text-ink-muted">{isBn ? 'প্রায়শই জিজ্ঞাসিত' : 'FAQ'}</span></li>
                    </ul>
                </div>

                {/* Get in touch */}
                <div className="col-span-2 md:col-span-1">
                    <h6 className="font-semibold text-ink mb-4 text-sm uppercase tracking-wider">
                        {isBn ? 'যোগাযোগ' : 'Get in Touch'}
                    </h6>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-2 text-ink-muted">
                            <FiMapPin className="mt-0.5 text-primary flex-shrink-0" />
                            <span>{isBn ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh'}</span>
                        </li>
                        <li className="flex items-start gap-2 text-ink-muted">
                            <FiPhone className="mt-0.5 text-primary flex-shrink-0" />
                            <a href={`tel:+${number}`} className="hover:text-primary transition-colors">+{number}</a>
                        </li>
                        <li className="flex items-start gap-2 text-ink-muted">
                            <FiMail className="mt-0.5 text-primary flex-shrink-0" />
                            <a href="mailto:support@banglacraft.com" className="hover:text-primary transition-colors">support@banglacraft.com</a>
                        </li>
                        <li className="text-ink-muted text-xs pt-1">
                            {t('available hours')}
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-border-soft">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-muted">
                    <p>© {new Date().getFullYear()} BanglaCraft. {isBn ? 'সকল অধিকার সংরক্ষিত।' : 'All rights reserved.'}</p>
                    <div className="flex items-center gap-3">
                        <span>{isBn ? 'পেমেন্ট:' : 'We accept:'}</span>
                        <span className="px-2 py-1 rounded bg-pink-100 text-pink-700 font-bold text-[10px]">bKash</span>
                        <span className="px-2 py-1 rounded bg-orange-100 text-orange-700 font-bold text-[10px]">Nagad</span>
                        <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 font-bold text-[10px]">Card</span>
                        <span className="px-2 py-1 rounded bg-border-soft text-ink-soft font-bold text-[10px]">COD</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
