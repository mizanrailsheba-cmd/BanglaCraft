import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaWhatsapp, FaFacebookF, FaInstagram } from 'react-icons/fa';
import { FiMail, FiPhone, FiMapPin, FiSend, FiClock } from 'react-icons/fi';

const ContactPage = () => {
    const { t, i18n } = useTranslation();
    const isBn = i18n.language === 'bn';
    const number = import.meta.env.VITE_WHATSAPP_NUMBER || '8801XXXXXXXXX';
    const waHref = `https://wa.me/${number}?text=${encodeURIComponent(isBn ? 'হ্যালো BanglaCraft' : 'Hello BanglaCraft')}`;

    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sent, setSent] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        // Hook up to backend later. For now, deep-link the message into WhatsApp.
        const body = `Name: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\n\n${form.message}`;
        window.open(`https://wa.me/${number}?text=${encodeURIComponent(body)}`, '_blank');
        setSent(true);
        setTimeout(() => setSent(false), 4000);
        setForm({ name: '', email: '', subject: '', message: '' });
    };

    const cards = [
        {
            Icon: FaWhatsapp,
            title: t('whatsapp support'),
            value: `+${number}`,
            href: waHref,
            tone: 'bg-green-50 text-green-600',
            cta: t('whatsapp us'),
        },
        {
            Icon: FiMail,
            title: isBn ? 'ইমেইল' : 'Email',
            value: 'support@banglacraft.com',
            href: 'mailto:support@banglacraft.com',
            tone: 'bg-blue-50 text-blue-600',
            cta: isBn ? 'ইমেইল পাঠান' : 'Send email',
        },
        {
            Icon: FiMapPin,
            title: isBn ? 'ঠিকানা' : 'Address',
            value: isBn ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh',
            href: '#',
            tone: 'bg-amber-50 text-amber-600',
            cta: isBn ? 'মানচিত্রে দেখুন' : 'View on map',
        },
    ];

    return (
        <section className="animate-fade-in">
            {/* Hero */}
            <div className="mb-10 text-center max-w-2xl mx-auto">
                <p className="section-eyebrow mb-2">{isBn ? 'যোগাযোগ' : 'Get in touch'}</p>
                <h1 className="section-title text-primary mb-3">{t('contact us')}</h1>
                <p className="text-ink-muted">
                    {isBn
                        ? 'আমাদের যেকোনো প্রশ্ন, পরামর্শ বা অর্ডার সম্পর্কিত সাহায্যের জন্য নিচের যেকোনো উপায়ে যোগাযোগ করুন।'
                        : 'Have a question, feedback, or need help with an order? Reach us through any of the channels below.'}
                </p>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                {cards.map(c => (
                    <a
                        key={c.title}
                        href={c.href}
                        target={c.href.startsWith('http') ? '_blank' : undefined}
                        rel="noreferrer"
                        className="card card-hover p-6 group"
                    >
                        <div className={`w-12 h-12 rounded-xl ${c.tone} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <c.Icon className="text-xl" />
                        </div>
                        <h3 className="font-semibold text-ink mb-1">{c.title}</h3>
                        <p className="text-ink-muted text-sm mb-3">{c.value}</p>
                        <span className="text-primary text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1">
                            {c.cta} →
                        </span>
                    </a>
                ))}
            </div>

            {/* Form + side info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card p-6 md:p-8 lg:col-span-2">
                    <h2 className="font-heading text-2xl text-ink mb-1">
                        {isBn ? 'আমাদের একটি বার্তা পাঠান' : 'Send us a message'}
                    </h2>
                    <p className="text-ink-muted text-sm mb-6">
                        {isBn ? 'আমরা সাধারণত ২৪ ঘণ্টার মধ্যে উত্তর দিই।' : 'We usually reply within 24 hours.'}
                    </p>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">{isBn ? 'নাম' : 'Name'}</label>
                                <input
                                    required
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder={isBn ? 'আপনার নাম' : 'Your name'}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="label">{isBn ? 'ইমেইল' : 'Email'}</label>
                                <input
                                    required
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="you@email.com"
                                    className="input"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label">{isBn ? 'বিষয়' : 'Subject'}</label>
                            <input
                                required
                                value={form.subject}
                                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                                placeholder={isBn ? 'কী নিয়ে কথা বলতে চান?' : 'What is this about?'}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="label">{isBn ? 'বার্তা' : 'Message'}</label>
                            <textarea
                                required
                                rows={5}
                                value={form.message}
                                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                placeholder={isBn ? 'আপনার বার্তা লিখুন...' : 'Write your message...'}
                                className="input resize-none"
                            />
                        </div>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <p className="text-xs text-ink-muted">
                                {isBn ? 'হোয়াটসঅ্যাপের মাধ্যমে দ্রুত উত্তর পেতে পারেন।' : 'Tip: WhatsApp gets the fastest reply.'}
                            </p>
                            <button type="submit" className="btn-primary">
                                <FiSend />
                                {sent ? (isBn ? 'পাঠানো হয়েছে!' : 'Sent!') : (isBn ? 'বার্তা পাঠান' : 'Send message')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Side panel */}
                <aside className="space-y-4">
                    <div className="card p-6 bg-soft-gradient">
                        <h3 className="font-heading text-lg text-ink mb-3 flex items-center gap-2">
                            <FiClock className="text-primary" />
                            {isBn ? 'কাজের সময়' : 'Hours'}
                        </h3>
                        <ul className="text-sm text-ink-soft space-y-1">
                            <li className="flex justify-between">
                                <span>{isBn ? 'শনি – বৃহঃ' : 'Sat – Thu'}</span>
                                <span className="font-medium">9 AM – 9 PM</span>
                            </li>
                            <li className="flex justify-between">
                                <span>{isBn ? 'শুক্র' : 'Friday'}</span>
                                <span className="font-medium text-ink-muted">{isBn ? 'বন্ধ' : 'Closed'}</span>
                            </li>
                        </ul>
                    </div>

                    <div className="card p-6">
                        <h3 className="font-heading text-lg text-ink mb-3">{isBn ? 'সোশ্যাল' : 'Follow us'}</h3>
                        <div className="flex gap-2">
                            {[
                                { Icon: FaFacebookF, href: '#', label: 'Facebook', color: 'hover:bg-blue-600' },
                                { Icon: FaInstagram, href: '#', label: 'Instagram', color: 'hover:bg-pink-600' },
                                { Icon: FaWhatsapp, href: waHref, label: 'WhatsApp', color: 'hover:bg-whatsapp' },
                            ].map(({ Icon, href, label, color }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={label}
                                    className={`w-10 h-10 rounded-full bg-border-soft text-ink-soft flex items-center justify-center hover:text-white transition-colors ${color}`}
                                >
                                    <Icon />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="card p-6">
                        <h3 className="font-heading text-lg text-ink mb-2 flex items-center gap-2">
                            <FiPhone className="text-primary" />
                            {isBn ? 'ফোন' : 'Phone'}
                        </h3>
                        <a href={`tel:+${number}`} className="text-primary font-semibold hover:underline">
                            +{number}
                        </a>
                    </div>
                </aside>
            </div>
        </section>
    );
};

export default ContactPage;
