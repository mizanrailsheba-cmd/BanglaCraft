import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { useTranslation } from 'react-i18next';

const ProductsPage = () => {
    const { t, i18n } = useTranslation();

    const { data, isLoading, error } = useQuery('products', async () => {
        const res = await api.get('/products');
        return res.data;
    });

    if (isLoading) return <p>{t('loading', 'Loading...')}</p>;
    if (error) return <p className="text-red-500">{t('error', 'Failed to load products')}</p>;

    return (
        <section>
            <h1 className="text-3xl font-heading text-primary mb-6">{t('products')}</h1>
            {data?.length === 0 ? (
                <p>{t('no products found')}</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {data?.map((product) => (
                        <article key={product.id} className="bg-white rounded-lg shadow-sm p-4">
                            <div className="h-48 bg-gray-100 rounded-lg mb-4" />
                            <h2 className="text-xl font-semibold">{i18n.language === 'bn' ? product.name_bn : product.name_en}</h2>
                            <p className="text-gray-600">{i18n.language === 'bn' ? product.description_bn : product.description_en}</p>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="font-semibold">{product.price || 0} BDT</span>
                                <Link to={`/products/${product.slug}`} className="text-white bg-primary rounded px-3 py-1">{t('add to cart')}</Link>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
};

export default ProductsPage;
