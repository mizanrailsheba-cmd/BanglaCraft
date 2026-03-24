import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { useTranslation } from 'react-i18next';
import WhatsAppProductBtn from '../components/WhatsAppProductBtn';

const ProductDetailPage = () => {
    const { slug } = useParams();
    const { t, i18n } = useTranslation();

    const { data, isLoading, error } = useQuery(['product', slug], async () => {
        const res = await api.get(`/products/${slug}`);
        return res.data;
    }, { enabled: !!slug });

    if (isLoading) return <p>{t('loading', 'Loading...')}</p>;
    if (error) return <p className="text-red-500">{t('error', 'Failed to load product')}</p>;
    if (!data) return <p>{t('no products found')}</p>;

    const name = i18n.language === 'bn' ? data.name_bn : data.name_en;
    const description = i18n.language === 'bn' ? data.description_bn : data.description_en;

    return (
        <section>
            <h1 className="text-3xl font-heading text-primary">{name}</h1>
            <p className="text-gray-700 mt-2">{description}</p>
            <p className="mt-4 font-bold">{data.price} BDT</p>
            <button className="mt-3 px-4 py-2 bg-secondary text-white rounded-lg">{t('add to cart')}</button>
            <div className="mt-3">
                <WhatsAppProductBtn product={data} />
            </div>
        </section>
    );
};

export default ProductDetailPage;
