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
                base: '#1c1917', // Stone-900
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
                linen: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E\")",
                noise: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
            },
            boxShadow: {
                glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                glow: '0 0 20px rgba(217, 119, 6, 0.4)',
                'glass-inner': 'inset 0 1px 0 0 rgba(255,255,255,0.1)',
                'neon-amber': '0 0 25px rgba(217, 119, 6, 0.5), 0 0 50px rgba(217, 119, 6, 0.2)',
                'neon-amber-lg': '0 0 35px rgba(217, 119, 6, 0.7), 0 0 60px rgba(217, 119, 6, 0.3)',
                'neon-dark': '0 0 25px rgba(120, 113, 108, 0.4), 0 0 50px rgba(120, 113, 108, 0.2)',
                'neon-dark-lg': '0 0 35px rgba(120, 113, 108, 0.6), 0 0 60px rgba(120, 113, 108, 0.3)',
                'neon-stone': '0 0 20px rgba(168, 162, 158, 0.3), 0 0 40px rgba(168, 162, 158, 0.15)',
                'neon-stone-lg': '0 0 30px rgba(168, 162, 158, 0.5), 0 0 50px rgba(168, 162, 158, 0.25)',
            },
            animation: {
                'slow-zoom': 'zoom 20s infinite alternate',
                'fade-in-up': 'fadeInUp 1s ease-out forwards',
                'neon-pulse': 'neonPulse 2s ease-in-out infinite',
            },
            keyframes: {
                zoom: {
                    '0%': { transform: 'scale(1)' },
                    '100%': { transform: 'scale(1.15)' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                neonPulse: {
                    '0%, 100%': { 
                        borderColor: 'rgba(217, 119, 6, 0.5)',
                        boxShadow: '0 0 5px rgba(217, 119, 6, 0.3), inset 0 0 5px rgba(217, 119, 6, 0.1)'
                    },
                    '50%': { 
                        borderColor: 'rgba(217, 119, 6, 0.8)',
                        boxShadow: '0 0 15px rgba(217, 119, 6, 0.6), inset 0 0 10px rgba(217, 119, 6, 0.2)'
                    },
                }
            }
        },
    },
    plugins: [
        ({ addComponents }) => {
            addComponents({
                '.glass-panel': {
                    '@apply bg-stone-900/40 backdrop-blur-xl border border-white/10 shadow-xl': {},
                },
            });
        },
    ]
};
