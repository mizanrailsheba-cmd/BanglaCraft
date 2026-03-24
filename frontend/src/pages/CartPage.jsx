import { useTranslation } from 'react-i18next';

const CartPage = () => {
    const { t } = useTranslation();

    return (
        <section>
            <h1 className="text-3xl font-heading text-primary">{t('cart')}</h1>
            <p>{t('no products found')}</p>
        </section>
    );
};

export default CartPage;
