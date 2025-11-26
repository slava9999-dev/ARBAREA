/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // enable dark mode via .dark class
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                // Палитра Arbarea
                background: '#1c1917', // stone-900
                surface: '#292524',    // stone-800
                primary: '#d97706',    // amber-600 (Gold)
                secondary: '#e7e5e4',  // stone-200 (Text)
                muted: '#a8a29e',      // stone-400
            },
            fontFamily: {
                serif: ['"Cormorant Garamond"', 'serif'],
                sans: ['"Manrope"', 'sans-serif'],
            },
            backgroundImage: {
                'noise': "url('/assets/noise.png')", // Если будем использовать текстуру
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'glow': '0 0 20px rgba(217, 119, 6, 0.3)', // Золотое свечение
            }
        },
    },
    plugins: [
        function ({ addComponents }) {
            addComponents({
                '.glass-panel': {
                    '@apply bg-stone-900/40 backdrop-blur-xl border border-white/10 shadow-xl': {},
                },
            });
        },
    ]
};
