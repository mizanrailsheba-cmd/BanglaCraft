import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiChevronRight, FiMinus, FiPlus, FiShoppingCart, FiHeart, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';
import api from '../api/client';
import { useTranslation } from 'react-i18next';
import WhatsAppProductBtn from '../components/WhatsAppProductBtn';

const ProductDetailPage = () => {
    const { slug } = useParams();
    const { t, i18n } = useTranslation();
    const [activeImage, setActiveImage] = useState(0);
    const [lightbox, setLightbox] = useState(false);
    const [qty, setQty] = useState(1);

    const { data, isLoading, error } = useQuery({
        queryKey: ['product', slug],
        queryFn: async () => {
            const res = await api.get(`/api/products/${slug}`);
            return res.data;
        },
        enabled: !!slug,
    });

    if (isLoading) {
        return (
            <section className="animate-fade-in max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="skeleton h-[480px] rounded-2xl" />
                    <div className="space-y-4">
                        <div className="skeleton h-4 w-1/3" />
                        <div className="skeleton h-8 w-3/4" />
                        <div className="skeleton h-6 w-1/4" />
                        <div className="skeleton h-20 w-full" />
                        <div className="skeleton h-12 w-full" />
                    </div>
                </div>
            </section>
        );
    }

    if (error) return <div className="card p-8 text-center text-red-500">{t('error', 'Failed to load product')}</div>;
    if (!data) return <div className="card p-8 text-center">{t('no products found')}</div>;

    const name = i18n.language === 'bn' ? data.name_bn : data.name_en;
    const description = i18n.language === 'bn' ? data.description_bn : data.description_en;
    const images = data.images || [];
    const inStock = data.stock_quantity > 0;
    const discount = data.sale_price
        ? Math.round((1 - data.sale_price / data.price) * 100)
        : 0;
    const finalPrice = data.sale_price ?? data.price;

    const decQty = () => setQty(q => Math.max(1, q - 1));
    const incQty = () => setQty(q => Math.min(data.stock_quantity || 99, q + 1));

    return (
        <section className="animate-fade-in max-w-6xl mx-auto">

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1.5 text-sm text-ink-muted mb-6 flex-wrap">
                <Link to="/" className="hover:text-primary transition-colors">{t('home')}</Link>
                <FiChevronRight className="text-xs" />
                <Link to="/products" className="hover:text-primary transition-colors">{t('products')}</Link>
                <FiChevronRight className="text-xs" />
                <span className="text-ink truncate max-w-[200px]">{name}</span>
            </nav>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {/* ── Images ── */}
                <div>
                    <div
                        className="aspect-square bg-white rounded-2xl overflow-hidden mb-3 cursor-zoom-in border border-border-soft shadow-soft flex items-center justify-center group"
                        onClick={() => images.length > 0 && setLightbox(true)}
                    >
                        {images.length > 0 ? (
                            <img
                                src={images[activeImage]}
                                alt={name}
                                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="text-ink-muted text-sm">No Image</div>
                        )}
                    </div>

                    {images.length > 1 && (
                        <div className="grid grid-cols-5 gap-2">
                            {images.slice(0, 5).map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeImage === i
                                        ? 'border-primary shadow-soft'
                                        : 'border-transparent hover:border-border opacity-70 hover:opacity-100'}`}
                                >
                                    <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover bg-white" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Details ── */}
                <div className="flex flex-col">
                    {data.category?.name_en && (
                        <p className="section-eyebrow mb-3">
                            {i18n.language === 'bn' ? data.category.name_bn : data.category.name_en}
                        </p>
                    )}

                    <h1 className="font-heading text-3xl lg:text-4xl text-ink mb-3 leading-tight">{name}</h1>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 flex-wrap mb-5">
                        <span className="text-3xl font-bold text-primary">৳{finalPrice}</span>
                        {discount > 0 && (
                            <>
                                <span className="text-lg text-ink-muted line-through">৳{data.price}</span>
                                <span className="badge bg-primary text-white">-{discount}%</span>
                            </>
                        )}
                    </div>

                    {/* Stock */}
                    <div className="mb-5">
                        {inStock ? (
                            <span className="inline-flex items-center gap-1.5 text-sm text-green-700 font-medium">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                {i18n.language === 'bn' ? 'স্টকে আছে' : 'In Stock'}
                                <span className="text-ink-muted font-normal">({data.stock_quantity})</span>
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 text-sm text-red-500 font-medium">
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                {t('out of stock')}
                            </span>
                        )}
                    </div>

                    <p className="text-ink-soft leading-relaxed mb-6">{description}</p>

                    {/* Tags */}
                    {data.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {data.tags.map((tag, i) => (
                                <span key={i} className="badge-accent">#{tag}</span>
                            ))}
                        </div>
                    )}

                    {/* Quantity stepper */}
                    {inStock && (
                        <div className="flex items-center gap-4 mb-5">
                            <span className="label !mb-0">{i18n.language === 'bn' ? 'পরিমাণ' : 'Quantity'}</span>
                            <div className="inline-flex items-center border border-border rounded-lg bg-white">
                                <button
                                    onClick={decQty}
                                    disabled={qty <= 1}
                                    className="w-10 h-10 flex items-center justify-center text-ink-soft hover:text-primary disabled:opacity-30"
                                    aria-label="Decrease"
                                >
                                    <FiMinus />
                                </button>
                                <span className="w-10 text-center font-semibold text-ink">{qty}</span>
                                <button
                                    onClick={incQty}
                                    disabled={qty >= data.stock_quantity}
                                    className="w-10 h-10 flex items-center justify-center text-ink-soft hover:text-primary disabled:opacity-30"
                                    aria-label="Increase"
                                >
                                    <FiPlus />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <button
                            disabled={!inStock}
                            className="btn-primary flex-1 !py-3 text-base"
                        >
                            <FiShoppingCart /> {t('add to cart')}
                        </button>
                        <button
                            aria-label="Wishlist"
                            className="btn-outline !px-4"
                        >
                            <FiHeart />
                        </button>
                    </div>

                    <WhatsAppProductBtn product={data} />

                    {/* Trust badges */}
                    <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-border-soft">
                        {[
                            { Icon: FiTruck, label: i18n.language === 'bn' ? 'ফ্রি ডেলিভারি' : 'Free Delivery' },
                            { Icon: FiShield, label: i18n.language === 'bn' ? 'নিরাপদ পেমেন্ট' : 'Secure Pay' },
                            { Icon: FiRefreshCw, label: i18n.language === 'bn' ? 'সহজ রিটার্ন' : 'Easy Returns' },
                        ].map(({ Icon, label }) => (
                            <div key={label} className="text-center">
                                <Icon className="mx-auto text-primary text-lg mb-1" />
                                <p className="text-xs text-ink-muted">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Lightbox ── */}
            {lightbox && (
                <div
                    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center animate-fade-in"
                    onClick={() => setLightbox(false)}
                >
                    <button
                        className="absolute top-4 right-4 text-white text-3xl hover:text-primary z-10 w-10 h-10 flex items-center justify-center"
                        onClick={() => setLightbox(false)}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                    {images.length > 1 && (
                        <button
                            className="absolute left-4 text-white text-4xl hover:text-primary z-10 w-12 h-12 flex items-center justify-center"
                            onClick={(e) => { e.stopPropagation(); setActiveImage(i => (i - 1 + images.length) % images.length); }}
                        >
                            ‹
                        </button>
                    )}
                    <img
                        src={images[activeImage]}
                        alt={name}
                        className="max-h-[90vh] max-w-[90vw] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                    {images.length > 1 && (
                        <button
                            className="absolute right-4 text-white text-4xl hover:text-primary z-10 w-12 h-12 flex items-center justify-center"
                            onClick={(e) => { e.stopPropagation(); setActiveImage(i => (i + 1) % images.length); }}
                        >
                            ›
                        </button>
                    )}
                    {images.length > 1 && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm bg-white/15 backdrop-blur px-3 py-1 rounded-full">
                            {activeImage + 1} / {images.length}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default ProductDetailPage;
