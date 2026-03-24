import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HomePage = () => {
    const { t } = useTranslation();
    return (
        <section className="py-12">
            <div className="text-center">
                <h1 className="font-heading text-4xl md:text-6xl text-primary">BanglaCraft</h1>
                <p className="mt-4 text-xl text-gray-700">{t('tagline', 'Crafted with Heart, Rooted in Bangladesh')}</p>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <article className="p-6 bg-white rounded-xl shadow-sm">
                    <h2 className="font-semibold text-2xl">{t('products')}</h2>
                    <p className="mt-2 text-gray-600">Browse handmade collections across categories.</p>
                    <Link to="/products" className="mt-4 inline-block px-5 py-2 text-white bg-secondary rounded-lg">{t('products')}</Link>
                </article>
                <article className="p-6 bg-white rounded-xl shadow-sm">
                    <h2 className="font-semibold text-2xl">{t('contact us')}</h2>
                    <p className="mt-2 text-gray-600">Ask anything via WhatsApp or email.</p>
                    <Link to="/contact" className="mt-4 inline-block px-5 py-2 text-white bg-secondary rounded-lg">{t('contact us')}</Link>
                </article>
            </div>
        </section>
    );
};

export default HomePage;
