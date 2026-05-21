import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiSearch, FiX } from 'react-icons/fi';
import api from '../api/client';
import { useTranslation } from 'react-i18next';

const CATEGORIES = [
    { slug: 'all', en: 'All', bn: 'সব' },
    { slug: 'textile', en: 'Textile', bn: 'কাপড়' },
    { slug: 'handicrafts', en: 'Handicraft', bn: 'হস্তশিল্প' },
    { slug: 'pottery', en: 'Pottery', bn: 'মাটির পাত্র' },
    { slug: 'jewelry', en: 'Jewelry', bn: 'গহনা' },
    { slug: 'woodcraft', en: 'Woodcraft', bn: 'কাঠের শিল্প' },
    { slug: 'painting', en: 'Painting', bn: 'চিত্রকলা' },
    { slug: 'home-decor', en: 'Home Decor', bn: 'গৃহসজ্জা' },
];

const SORT_OPTIONS = [
    { value: 'featured', en: 'Featured', bn: 'বিশেষ' },
    { value: 'price-asc', en: 'Price: Low to High', bn: 'দাম: কম থেকে বেশি' },
    { value: 'price-desc', en: 'Price: High to Low', bn: 'দাম: বেশি থেকে কম' },
    { value: 'name-asc', en: 'Name: A–Z', bn: 'নাম: A–Z' },
];

const ProductCard = ({ product, lang, t }) => {
    const name = lang === 'bn' ? product.name_bn : product.name_en;
    const discount = product.sale_price
        ? Math.round((1 - product.sale_price / product.price) * 100)
        : 0;

    return (
        <Link
            to={`/products/${product.slug}`}
            className="group card card-hover overflow-hidden flex flex-col"
        >
            <div className="relative aspect-square bg-border-soft overflow-hidden">
                {product.images?.[0] ? (
                    <img
                        src={product.images[0]}
                        alt={name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-muted text-5xl">
                        🧺
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {discount > 0 && (
                        <span className="badge bg-primary text-white shadow-soft">
                            -{discount}%
                        </span>
                    )}
                    {product.stock_quantity === 0 && (
                        <span className="badge bg-ink/80 text-white">
                            {t('out of stock')}
                        </span>
                    )}
                </div>

                {/* Quick view hint on hover */}
                <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/95 backdrop-blur-sm py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-primary">
                    {t('view details', 'View Details')}
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-medium text-ink line-clamp-2 mb-2 leading-snug">
                    {name}
                </h3>
                <div className="mt-auto flex items-baseline gap-2">
                    {product.sale_price ? (
                        <>
                            <span className="text-primary font-bold text-lg">৳{product.sale_price}</span>
                            <span className="text-xs text-ink-muted line-through">৳{product.price}</span>
                        </>
                    ) : (
                        <span className="text-primary font-bold text-lg">৳{product.price}</span>
                    )}
                </div>
            </div>
        </Link>
    );
};

const ProductSkeleton = () => (
    <div className="card overflow-hidden">
        <div className="skeleton aspect-square rounded-none" />
        <div className="p-4 space-y-2">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-5 w-1/3 mt-3" />
        </div>
    </div>
);

const ProductsPage = () => {
    const { t, i18n } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('featured');
    const activeCategory = searchParams.get('category') || 'all';

    const setCategory = (slug) => {
        const next = new URLSearchParams(searchParams);
        if (slug === 'all') next.delete('category');
        else next.set('category', slug);
        setSearchParams(next);
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeCategory]);

    const { data, isLoading, error } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await api.get('/api/products');
            return res.data;
        }
    });

    const filtered = useMemo(() => {
        let list = data || [];
        if (activeCategory !== 'all') {
            list = list.filter(p => {
                const cat = (p.category?.slug || p.category_slug || p.category || '').toString().toLowerCase();
                return cat === activeCategory;
            });
        }
        if (search.trim()) {
            const q = search.toLowerCase().trim();
            list = list.filter(p =>
                (p.name_en || '').toLowerCase().includes(q) ||
                (p.name_bn || '').toLowerCase().includes(q) ||
                (p.description_en || '').toLowerCase().includes(q)
            );
        }
        const sorted = [...list];
        const priceOf = (p) => p.sale_price ?? p.price ?? 0;
        switch (sort) {
            case 'price-asc': sorted.sort((a, b) => priceOf(a) - priceOf(b)); break;
            case 'price-desc': sorted.sort((a, b) => priceOf(b) - priceOf(a)); break;
            case 'name-asc': sorted.sort((a, b) => (a.name_en || '').localeCompare(b.name_en || '')); break;
            default: break;
        }
        return sorted;
    }, [data, activeCategory, search, sort]);

    return (
        <section className="animate-fade-in">
            {/* Page header */}
            <div className="mb-8">
                <p className="section-eyebrow mb-2">{i18n.language === 'bn' ? 'কেনাকাটা' : 'Shop'}</p>
                <h1 className="section-title text-primary">{t('products')}</h1>
                <p className="text-ink-muted mt-2">
                    {i18n.language === 'bn'
                        ? 'বাংলাদেশের কারিগরদের হাতে তৈরি অনন্য পণ্যের সংগ্রহ'
                        : 'A curated collection of handcrafted goods from Bangladesh'}
                </p>
            </div>

            {/* Toolbar: search + sort */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('search products')}
                        className="input !pl-10"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-primary"
                            aria-label="Clear"
                        >
                            <FiX />
                        </button>
                    )}
                </div>
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="input md:w-56"
                >
                    {SORT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                            {i18n.language === 'bn' ? opt.bn : opt.en}
                        </option>
                    ))}
                </select>
            </div>

            {/* Category chips */}
            <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
                {CATEGORIES.map(cat => {
                    const active = activeCategory === cat.slug;
                    return (
                        <button
                            key={cat.slug}
                            onClick={() => setCategory(cat.slug)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${active
                                ? 'bg-primary text-white border-primary shadow-glow'
                                : 'bg-white text-ink-soft border-border hover:border-primary hover:text-primary'}`}
                        >
                            {i18n.language === 'bn' ? cat.bn : cat.en}
                        </button>
                    );
                })}
            </div>

            {/* Results count */}
            {!isLoading && !error && (
                <p className="text-sm text-ink-muted mb-4">
                    {filtered.length} {i18n.language === 'bn' ? 'টি পণ্য' : (filtered.length === 1 ? 'product' : 'products')}
                </p>
            )}

            {/* Grid */}
            {error ? (
                <div className="card p-8 text-center">
                    <p className="text-red-500 font-medium">
                        {t('error', 'Failed to load products')}
                    </p>
                </div>
            ) : isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="card p-12 text-center">
                    <p className="text-5xl mb-4">🧺</p>
                    <h3 className="font-heading text-xl text-ink mb-2">{t('no products found')}</h3>
                    <p className="text-ink-muted text-sm mb-5">
                        {i18n.language === 'bn'
                            ? 'অন্য ক্যাটাগরি দেখুন বা সার্চ পরিবর্তন করুন'
                            : 'Try a different category or search term'}
                    </p>
                    <button
                        onClick={() => { setSearch(''); setCategory('all'); setSort('featured'); }}
                        className="btn-outline"
                    >
                        {i18n.language === 'bn' ? 'রিসেট' : 'Reset filters'}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filtered.map(product => (
                        <ProductCard key={product.id} product={product} lang={i18n.language} t={t} />
                    ))}
                </div>
            )}
        </section>
    );
};

export default ProductsPage;
