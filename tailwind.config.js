/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // enable dark mode via .dark class
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}"
    ],
                '.glass-panel': {
                    '@apply bg-stone-900/40 backdrop-blur-xl border border-white/10 shadow-xl': {},
                },
            });
        },
    ]
};
