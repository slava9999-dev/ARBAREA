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
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a'
                }
            }
        }
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
