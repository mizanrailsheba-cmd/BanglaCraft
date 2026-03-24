/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: '#C0622F',
                secondary: '#2D5016',
                accent: '#D4A017',
                background: '#FDF6EC',
                whatsapp: '#25D366',
            },
            fontFamily: {
                heading: ['Playfair Display', 'serif'],
                body: ['Inter', 'sans-serif'],
                bn: ['Hind Siliguri', 'Noto Sans Bengali', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
