import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { useTranslation } from 'react-i18next';
import WhatsAppProductBtn from '../components/WhatsAppProductBtn';

const ProductDetailPage = () => {
    const { slug } = useParams();
    const { t, i18n } = useTranslation();
    const [activeImage, setActiveImage] = useState(0);

    const { data, isLoading, error } = useQuery({
        queryKey: ['product', slug],
        queryFn: async () => {
            const res = await api.get(`/api/products/${slug}`);
            return res.data;
        },
        enabled: !!slug
    });

    if (isLoading) return <p className="text-gray-400 text-center py-20">{t('loading', 'Loading...')}</p>;
    if (error) return <p className="text-red-500 text-center py-20">{t('error', 'Failed to load product')}</p>;
    if (!data) return <p className="text-center py-20">{t('no products found')}</p>;

    const name = i18n.language === 'bn' ? data.name_bn : data.name_en;
    const description = i18n.language === 'bn' ? data.description_bn : data.description_en;
    const images = data.images || [];

    return (
        <section className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                {/* ── Images ── */}
                <div>
                    {/* Main Image */}
                    <div className="h-96 bg-gray-100 rounded-2xl overflow-hidden mb-3">
                        {images.length > 0 ? (
                            <img
                                src={images[activeImage]}
                                alt={name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                No Image
                            </div>
                        )}
                    </div>

                    {/* Thumbnail Images */}
                    {images.length > 1 && (
                        <div className="flex gap-2 flex-wrap">
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImage === i ? 'border-primary' : 'border-transparent'
                                        }`}>
                                    <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Details ── */}
                <div className="flex flex-col justify-start">
                    <h1 className="text-3xl font-heading text-primary mb-2">{name}</h1>

                    {/* Price */}
                    <div className="mb-4">
                        {data.sale_price ? (
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-primary">৳{data.sale_price}</span>
                                <span className="text-lg text-gray-400 line-through">৳{data.price}</span>
                                <span className="text-sm bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                    {Math.round((1 - data.sale_price / data.price) * 100)}% OFF
                                </span>
                            </div>
                        ) : (
                            <span className="text-2xl font-bold text-primary">৳{data.price}</span>
                        )}
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">{description}</p>

                    {/* Stock */}
                    <p className="text-sm text-gray-400 mb-4">
                        {data.stock_quantity > 0
                            ? <span className="text-green-600">✓ In Stock ({data.stock_quantity} available)</span>
                            : <span className="text-red-500">✗ Out of Stock</span>
                        }
                    </p>

                    {/* Tags */}
                    {data.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {data.tags.map((tag, i) => (
                                <span key={i} className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full border border-amber-200">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <button className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors mb-3">
                        {t('add to cart', 'Add to Cart')}
                    </button>

                    <WhatsAppProductBtn product={data} />
                </div>
            </div>
        </section>
    );
};

export default ProductDetailPage;