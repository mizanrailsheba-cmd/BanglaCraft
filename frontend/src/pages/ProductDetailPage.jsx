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
    const [lightbox, setLightbox] = useState(false);

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
                    <div
                        className="h-[420px] bg-gray-50 rounded-2xl overflow-hidden mb-3 cursor-zoom-in border border-gray-100 flex items-center justify-center"
                        onClick={() => images.length > 0 && setLightbox(true)}
                    >
                        {images.length > 0 ? (
                            <img
                                src={images[activeImage]}
                                alt={name}
                                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="text-gray-300 text-sm">No Image</div>
                        )}
                    </div>

                    {/* Zoom hint */}
                    {images.length > 0 && (
                        <p className="text-xs text-gray-400 text-center mb-2">🔍 ছবিতে click করলে বড় হবে</p>
                    )}

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="flex gap-2 flex-wrap">
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activeImage === i
                                        ? 'border-primary scale-105'
                                        : 'border-transparent hover:border-gray-300'
                                        }`}
                                >
                                    <img src={img} alt={`thumb-${i}`} className="w-full h-full object-contain bg-gray-50" />
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
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-2xl font-bold text-primary">৳{data.sale_price}</span>
                                <span className="text-lg text-gray-400 line-through">৳{data.price}</span>
                                <span className="text-sm bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                                    {Math.round((1 - data.sale_price / data.price) * 100)}% OFF
                                </span>
                            </div>
                        ) : (
                            <span className="text-2xl font-bold text-primary">৳{data.price}</span>
                        )}
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">{description}</p>

                    {/* Stock */}
                    <p className="text-sm mb-4">
                        {data.stock_quantity > 0
                            ? <span className="text-green-600 font-medium">✓ In Stock ({data.stock_quantity} available)</span>
                            : <span className="text-red-500 font-medium">✗ Out of Stock</span>
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

            {/* ── Lightbox ── */}
            {lightbox && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
                    onClick={() => setLightbox(false)}
                >
                    {/* Close button */}
                    <button
                        className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-10"
                        onClick={() => setLightbox(false)}
                    >
                        ✕
                    </button>

                    {/* Previous button */}
                    {images.length > 1 && (
                        <button
                            className="absolute left-4 text-white text-4xl hover:text-gray-300 z-10 px-4 py-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveImage(i => (i - 1 + images.length) % images.length);
                            }}
                        >
                            ‹
                        </button>
                    )}

                    {/* Main Lightbox Image */}
                    <img
                        src={images[activeImage]}
                        alt={name}
                        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Next button */}
                    {images.length > 1 && (
                        <button
                            className="absolute right-4 text-white text-4xl hover:text-gray-300 z-10 px-4 py-2"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveImage(i => (i + 1) % images.length);
                            }}
                        >
                            ›
                        </button>
                    )}

                    {/* Thumbnail strip at bottom */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 flex gap-2 justify-center">
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={(e) => { e.stopPropagation(); setActiveImage(i); }}
                                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${activeImage === i ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-contain bg-gray-900" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Image counter */}
                    {images.length > 1 && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                            {activeImage + 1} / {images.length}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default ProductDetailPage;
