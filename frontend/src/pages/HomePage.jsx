import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../api/client';

const HomePage = () => {
    const { t, i18n } = useTranslation();

    const { data: products } = useQuery({
        queryKey: ['home-products'],
        queryFn: async () => {
            const res = await api.get('/api/products');
            return res.data;
        }
    });

    return (
        <section>

            {/* ── Hero Banner ── */}
            <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl overflow-hidden mb-12 px-8 py-16 text-center border border-amber-100">
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">হস্তশিল্পের গর্ব</p>
                <h1 className="font-heading text-5xl md:text-7xl text-primary mb-4">BanglaCraft</h1>
                <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
                    {t('tagline', 'Crafted with Heart, Rooted in Bangladesh')}
                </p>
                <Link
                    to="/products"
                    className="inline-block px-8 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors text-lg">
                    Shop Now →
                </Link>
            </div>

            {/* ── Category Chips ── */}
            <div className="flex gap-3 flex-wrap mb-10 justify-center">
                {['All', 'Textile', 'Handicraft', 'Pottery', 'Jewelry', 'Woodcraft'].map(cat => (
                    <Link
                        key={cat}
                        to={cat === 'All' ? '/products' : `/products?category=${cat.toLowerCase()}`}
                        className="px-4 py-2 rounded-full border border-amber-200 text-sm text-amber-800 bg-amber-50 hover:bg-primary hover:text-white hover:border-primary transition-colors">
                        {cat}
                    </Link>
                ))}
            </div>

            {/* ── Featured Products ── */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-heading text-primary">Featured Products</h2>
                    <p className="text-sm text-gray-400">আমাদের সেরা পণ্য সংগ্রহ</p>
                </div>
                <Link to="/products" className="text-sm text-primary hover:underline">
                    View All →
                </Link>
            </div>

            {!products || products.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-4xl mb-3">🧺</p>
                    <p>কোনো পণ্য পাওয়া যায়নি</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {products.slice(0, 8).map((product) => (
                        <Link
                            key={product.id}
                            to={`/products/${product.slug}`}
                            className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100">

                            {/* Image */}
                            <div className="h-52 bg-gray-50 overflow-hidden">
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name_en}
                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-200 text-4xl">
                                        🧺
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-3">
                                <h3 className="text-sm font-medium text-gray-800 truncate">
                                    {i18n.language === 'bn' ? product.name_bn : product.name_en}
                                </h3>
                                <div className="mt-1 flex items-center gap-2">
                                    {product.sale_price ? (
                                        <>
                                            <span className="text-primary font-bold">৳{product.sale_price}</span>
                                            <span className="text-xs text-gray-400 line-through">৳{product.price}</span>
                                            <span className="text-xs bg-red-100 text-red-500 px-1.5 rounded-full">
                                                {Math.round((1 - product.sale_price / product.price) * 100)}%
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-primary font-bold">৳{product.price}</span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* ── View All Button ── */}
            {products && products.length > 0 && (
                <div className="text-center mt-10">
                    <Link
                        to="/products"
                        className="inline-block px-8 py-3 border-2 border-primary text-primary rounded-full font-medium hover:bg-primary hover:text-white transition-colors">
                        সব পণ্য দেখুন
                    </Link>
                </div>
            )}

            {/* ── Features Section ── */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { icon: '🚚', title: 'Free Delivery', desc: 'সারাদেশে ডেলিভারি' },
                    { icon: '✋', title: 'Handmade', desc: '১০০% হাতে তৈরি' },
                    { icon: '💬', title: 'WhatsApp Support', desc: '৯টা - ৯টা সাপোর্ট' },
                ].map(f => (
                    <div key={f.title} className="flex items-center gap-4 bg-white rounded-xl p-5 border border-gray-100">
                        <span className="text-3xl">{f.icon}</span>
                        <div>
                            <p className="font-semibold text-gray-800">{f.title}</p>
                            <p className="text-sm text-gray-500">{f.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

        </section>
    );
};

export default HomePage;
