/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                background: '#1c1917',
                surface: '#292524',
                primary: '#d97706',
                secondary: '#a8a29e',
                muted: '#78716c',
            },
            fontFamily: {
                serif: ['Cormorant Garamond', 'serif'],
                sans: ['Manrope', 'sans-serif'],
            },
            backgroundImage: {
                noise: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
            },
            boxShadow: {
                glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                glow: '0 0 20px rgba(217, 119, 6, 0.4)',
            },
            animation: {
                'slow-zoom': 'zoom 20s infinite alternate',
            },
            keyframes: {
                zoom: {
                    '0%': { transform: 'scale(1)' },
                    '100%': { transform: 'scale(1.1)' },
                }
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
