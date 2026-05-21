import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiShoppingBag, FiArrowRight } from 'react-icons/fi';

const CartPage = () => {
    const { t, i18n } = useTranslation();
    const isBn = i18n.language === 'bn';

    return (
        <section className="animate-fade-in">
            <div className="mb-8">
                <p className="section-eyebrow mb-2">{isBn ? 'কেনাকাটা' : 'Shopping'}</p>
                <h1 className="section-title text-primary">{t('cart')}</h1>
            </div>

            <div className="card p-10 md:p-16 text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-50 flex items-center justify-center">
                    <FiShoppingBag className="text-3xl text-primary" />
                </div>
                <h2 className="font-heading text-2xl text-ink mb-2">
                    {isBn ? 'আপনার কার্ট খালি' : 'Your cart is empty'}
                </h2>
                <p className="text-ink-muted mb-8 max-w-sm mx-auto">
                    {isBn
                        ? 'মনে হচ্ছে এখনো কোনো পণ্য যোগ করা হয়নি। চলুন কিছু সুন্দর জিনিস খুঁজে পাই!'
                        : "Looks like you haven't added anything yet. Let's find something beautiful!"}
                </p>
                <Link to="/products" className="btn-primary inline-flex">
                    {isBn ? 'কেনাকাটা শুরু করুন' : 'Start shopping'}
                    <FiArrowRight />
                </Link>
            </div>
        </section>
    );
};

export default CartPage;
