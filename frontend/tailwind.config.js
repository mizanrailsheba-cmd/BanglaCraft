/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                // Brand
                primary: {
                    DEFAULT: '#C0622F',
                    dark: '#9B4E25',
                    light: '#E2845A',
                    50: '#FBF1EA',
                    100: '#F4DDC9',
                },
                secondary: {
                    DEFAULT: '#2D5016',
                    dark: '#1F3810',
                    light: '#4A7A2C',
                },
                accent: {
                    DEFAULT: '#D4A017',
                    dark: '#A87E0F',
                    light: '#EAC04A',
                },
                background: '#FDF6EC',
                surface: '#FFFFFF',
                ink: {
                    DEFAULT: '#1A1A1A',
                    soft: '#4A4A4A',
                    muted: '#7A7A7A',
                },
                border: {
                    DEFAULT: '#E7E2D7',
                    soft: '#F1ECDF',
                },
                whatsapp: '#25D366',
            },
            fontFamily: {
                heading: ['"Playfair Display"', 'serif'],
                body: ['Inter', 'sans-serif'],
                bn: ['"Hind Siliguri"', '"Noto Sans Bengali"', 'sans-serif'],
            },
            boxShadow: {
                soft: '0 2px 8px rgba(26, 26, 26, 0.04)',
                card: '0 4px 16px rgba(26, 26, 26, 0.06)',
                lift: '0 12px 28px rgba(26, 26, 26, 0.10)',
                glow: '0 4px 14px rgba(192, 98, 47, 0.25)',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-400px 0' },
                    '100%': { backgroundPosition: '400px 0' },
                },
                pulseRing: {
                    '0%': { transform: 'scale(0.8)', opacity: '0.6' },
                    '80%, 100%': { transform: 'scale(2.2)', opacity: '0' },
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out both',
                shimmer: 'shimmer 1.4s linear infinite',
                'pulse-ring': 'pulseRing 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
                'slide-down': 'slideDown 0.25s ease-out both',
            },
            backgroundImage: {
                'brand-gradient': 'linear-gradient(135deg, #C0622F 0%, #D4A017 100%)',
                'soft-gradient': 'linear-gradient(135deg, #FDF6EC 0%, #FBF1EA 100%)',
            },
        },
    },
    plugins: [],
};
