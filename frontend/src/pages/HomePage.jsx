import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../api/client';

// ── Hero slides ───────────────────────────────────────────────────
const SLIDES = [
    {
        img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1400&q=90',
        label: 'New Collection',
        title: 'বৈশাখী সংগ্রহ',
        sub: 'Traditional handwoven sarees for every occasion',
    },
    {
        img: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1400&q=90',
        label: 'Exclusive',
        title: 'হস্তশিল্পের সৌন্দর্য',
        sub: 'Crafted with love by skilled artisans of Bangladesh',
    },
    {
        img: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=1400&q=90',
        label: 'Premium',
        title: 'এক্সক্লুসিভ ডিজাইন',
        sub: 'Discover our finest handmade textile collection',
    },
];

// ── Category grid ─────────────────────────────────────────────────
const CATEGORIES = [
    { label: 'Textile', bn: 'কাপড়', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80', slug: 'textile' },
    { label: 'Handicraft', bn: 'হস্তশিল্প', img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80', slug: 'handicrafts' },
    { label: 'Pottery', bn: 'মাটির পাত্র', img: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80', slug: 'pottery' },
    { label: 'Jewelry', bn: 'গহনা', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80', slug: 'jewelry' },
    { label: 'Woodcraft', bn: 'কাঠের শিল্প', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', slug: 'woodcraft' },
    { label: 'Painting', bn: 'চিত্রকলা', img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80', slug: 'painting' },
    { label: 'Home Decor', bn: 'গৃহসজ্জা', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', slug: 'home-decor' },
    { label: 'Wedding', bn: 'বিবাহ', img: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80', slug: 'wedding' },
];

const HomePage = () => {
    const { i18n } = useTranslation();
    const [slide, setSlide] = useState(0);
    const [email, setEmail] = useState('');
    const sliderRef = useRef(null);

    // Auto slide every 4.5 seconds
    useEffect(() => {
        const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4500);
        return () => clearInterval(t);
    }, []);

    const { data: products } = useQuery({
        queryKey: ['home-products'],
        queryFn: async () => {
            const res = await api.get('/api/products');
            return res.data;
        }
    });

    const prevSlide = () => setSlide(s => (s - 1 + SLIDES.length) % SLIDES.length);
    const nextSlide = () => setSlide(s => (s + 1) % SLIDES.length);

    const scrollProducts = (dir) => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
        }
    };

    return (
        <div className="-mx-4 -my-6">

            {/* ────────────────── Hero Slider ────────────────── */}
            <div className="relative overflow-hidden" style={{ height: '85vh', maxHeight: 700 }}>
                {SLIDES.map((s, i) => (
                    <div
                        key={i}
                        className="absolute inset-0 transition-opacity duration-1000"
                        style={{ opacity: i === slide ? 1 : 0 }}
                    >
                        <img src={s.img} alt={s.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
                        <div className="absolute bottom-20 left-12 text-white">
                            <span className="text-xs font-semibold tracking-[0.3em] uppercase bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-4 inline-block">
                                {s.label}
                            </span>
                            <h1 className="font-heading text-5xl md:text-7xl mb-3 drop-shadow-lg mt-3">{s.title}</h1>
                            <p className="text-lg text-white/80 mb-6 max-w-md">{s.sub}</p>
                            <Link to="/products"
                                className="inline-block bg-white text-gray-900 px-8 py-3 font-semibold text-sm tracking-widest uppercase hover:bg-primary hover:text-white transition-colors">
                                SHOP NOW
                            </Link>
                        </div>
                    </div>
                ))}

                {/* Arrows */}
                <button onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm text-white text-2xl rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
                    ‹
                </button>
                <button onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm text-white text-2xl rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
                    ›
                </button>

                {/* Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {SLIDES.map((_, i) => (
                        <button key={i} onClick={() => setSlide(i)}
                            className={`h-2 rounded-full transition-all duration-300 ${i === slide ? 'bg-white w-6' : 'bg-white/50 w-2'}`} />
                    ))}
                </div>
            </div>

            {/* ────────────────── Category Grid ────────────────── */}
            <div className="px-6 py-12 bg-white">
                <h2 className="text-center text-2xl font-heading text-gray-800 mb-8 tracking-wider uppercase">
                    Shop by Category
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-6xl mx-auto">
                    {CATEGORIES.map(cat => (
                        <Link key={cat.slug} to={`/products?category=${cat.slug}`}
                            className="group relative overflow-hidden rounded-lg aspect-square">
                            <img src={cat.img} alt={cat.label}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" />
                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-center">
                                <p className="font-semibold text-sm uppercase tracking-wider">{cat.label}</p>
                                <p className="text-xs text-white/70">{cat.bn}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* ────────────────── What's New — Product Slider ────────────────── */}
            <div className="py-12 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-heading text-gray-800 tracking-wider uppercase">What's New</h2>
                            <p className="text-sm text-gray-400 mt-1">আমাদের সর্বশেষ সংগ্রহ</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => scrollProducts(-1)}
                                className="w-9 h-9 border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary transition-colors text-xl">
                                ‹
                            </button>
                            <button onClick={() => scrollProducts(1)}
                                className="w-9 h-9 border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary transition-colors text-xl">
                                ›
                            </button>
                        </div>
                    </div>

                    {!products || products.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <p className="text-4xl mb-3">🧺</p>
                            <p>কোনো পণ্য পাওয়া যায়নি</p>
                        </div>
                    ) : (
                        <div
                            ref={sliderRef}
                            className="flex gap-4 overflow-x-auto pb-4"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {products.map(product => (
                                <Link
                                    key={product.id}
                                    to={`/products/${product.slug}`}
                                    className="group flex-shrink-0 w-60 bg-white overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
                                >
                                    <div className="relative h-72 bg-gray-50 overflow-hidden">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt={product.name_en}
                                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-200 text-5xl">🧺</div>
                                        )}
                                        {/* + icon like Aarong */}
                                        <div className="absolute bottom-3 left-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-600 text-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                            +
                                        </div>
                                        {product.sale_price && (
                                            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                                {Math.round((1 - product.sale_price / product.price) * 100)}% OFF
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 border-t border-gray-100">
                                        <p className="text-sm font-medium text-gray-800 truncate">
                                            {i18n.language === 'bn' ? product.name_bn : product.name_en}
                                        </p>
                                        <div className="mt-1 flex items-center gap-2">
                                            {product.sale_price ? (
                                                <>
                                                    <span className="text-primary font-bold text-sm">৳{product.sale_price}</span>
                                                    <span className="text-xs text-gray-400 line-through">৳{product.price}</span>
                                                </>
                                            ) : (
                                                <span className="text-primary font-bold text-sm">৳{product.price}</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-8">
                        <Link to="/products"
                            className="inline-block border border-gray-800 text-gray-800 px-10 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-gray-800 hover:text-white transition-colors">
                            VIEW ALL
                        </Link>
                    </div>
                </div>
            </div>

            {/* ────────────────── Features ────────────────── */}
            <div className="bg-white border-y border-gray-100 py-8 px-6">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: '🚚', title: 'Free Delivery', desc: 'সারাদেশে বিনামূল্যে ডেলিভারি' },
                        { icon: '✋', title: '100% Handmade', desc: 'দক্ষ কারিগরদের হাতে তৈরি' },
                        { icon: '💬', title: 'WhatsApp Support', desc: 'সকাল ৯টা - রাত ৯টা সাপোর্ট' },
                    ].map(f => (
                        <div key={f.title} className="flex items-center gap-4 justify-center">
                            <span className="text-3xl">{f.icon}</span>
                            <div>
                                <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
                                <p className="text-xs text-gray-500">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ────────────────── Newsletter ────────────────── */}
            <div className="bg-amber-50 py-14 px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <p className="text-xs font-semibold tracking-[0.3em] uppercase text-primary mb-3">✉ Stay Tuned</p>
                    <h2 className="text-3xl font-heading text-gray-800 mb-2">সর্বশেষ আপডেট পান</h2>
                    <p className="text-gray-500 text-sm mb-8">
                        নতুন পণ্য, বিশেষ অফার ও ইভেন্টের খবর সবার আগে পান
                    </p>
                    <div className="flex gap-0 max-w-md mx-auto shadow-sm">
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="আপনার ইমেইল দিন"
                            className="flex-1 border border-gray-300 border-r-0 px-4 py-3 text-sm focus:outline-none focus:border-primary"
                        />
                        <button
                            onClick={() => { alert('সাবস্ক্রাইব সফল হয়েছে! ধন্যবাদ।'); setEmail(''); }}
                            className="bg-gray-900 text-white px-6 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-primary transition-colors whitespace-nowrap">
                            SUBSCRIBE
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default HomePage;
