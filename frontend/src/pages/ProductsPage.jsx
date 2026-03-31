import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { useTranslation } from 'react-i18next';

const ProductsPage = () => {
    const { t, i18n } = useTranslation();

    const { data, isLoading, error } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await api.get('/api/products');
            return res.data;
        }
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
                        <article key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            {/* Product Image */}
                            <div className="h-56 bg-gray-100 overflow-hidden">
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name_en}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                                        No Image
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                                    {i18n.language === 'bn' ? product.name_bn : product.name_en}
                                </h2>
                                <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                                    {i18n.language === 'bn' ? product.description_bn : product.description_en}
                                </p>

                                <div className="flex justify-between items-center mt-2">
                                    <div>
                                        {product.sale_price ? (
                                            <div>
                                                <span className="text-lg font-bold text-primary">৳{product.sale_price}</span>
                                                <span className="text-sm text-gray-400 line-through ml-2">৳{product.price}</span>
                                            </div>
                                        ) : (
                                            <span className="text-lg font-bold text-primary">৳{product.price}</span>
                                        )}
                                    </div>
                                    <Link
                                        to={`/products/${product.slug}`}
                                        className="text-white bg-primary rounded-lg px-4 py-1.5 text-sm hover:bg-primary/90 transition-colors">
                                        {t('view', 'View')}
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
};

export default ProductsPage;