/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      /* ═══════════════════════════════════════════════════════════════
         ARBAREA PREMIUM WOOD PALETTE
         Inspired by luxury wood: oak, walnut, wenge
         ═══════════════════════════════════════════════════════════════ */
      colors: {
        // Primary — Тёплый янтарь / медовый дуб
        wood: {
          amber: '#c9a45c',
          'amber-light': '#dbb978',
          'amber-dark': '#a8834a',
        },
        // Background — Глубокий венге
        bark: {
          DEFAULT: '#3d3027',
          light: '#4a3d32',
          dark: '#2d241c',
        },
        // Application backgrounds
        base: '#1a1614',
        surface: '#221e1a',
        card: '#2a2520',
        // Legacy compatibility
        background: '#1a1614',
        primary: '#c9a45c',
        secondary: '#bdb3a7',
        muted: '#8a7f74',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Manrope', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      backgroundImage: {
        // Subtle wood grain texture
        'wood-grain': `
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(201, 164, 92, 0.02) 2px,
            rgba(201, 164, 92, 0.02) 3px
          ),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 8px,
            rgba(0, 0, 0, 0.05) 8px,
            rgba(0, 0, 0, 0.05) 9px
          )
        `,
        // Premium gradients
        'gradient-amber': 'linear-gradient(135deg, #a8834a 0%, #c9a45c 100%)',
        'gradient-card': 'linear-gradient(180deg, #2a2520 0%, #221e1a 100%)',
        'gradient-radial-dark': 'radial-gradient(ellipse at center, rgba(201, 164, 92, 0.08) 0%, transparent 70%)',
        // Legacy
        linen: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
        noise: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        // Premium wood shadows
        'wood-sm': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'wood-md': '0 4px 16px rgba(0, 0, 0, 0.4)',
        'wood-lg': '0 8px 32px rgba(0, 0, 0, 0.5)',
        'wood-glow': '0 0 20px rgba(201, 164, 92, 0.4)',
        'wood-glow-lg': '0 0 40px rgba(201, 164, 92, 0.5), 0 0 60px rgba(201, 164, 92, 0.2)',
        'wood-inner': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        // Legacy compatibility
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        glow: '0 0 20px rgba(201, 164, 92, 0.4)',
        'glass-inner': 'inset 0 1px 0 0 rgba(255,255,255,0.1)',
        'neon-amber': '0 0 25px rgba(201, 164, 92, 0.5), 0 0 50px rgba(201, 164, 92, 0.2)',
        'neon-amber-lg': '0 0 35px rgba(201, 164, 92, 0.7), 0 0 60px rgba(201, 164, 92, 0.3)',
      },
      animation: {
        'slow-zoom': 'zoom 20s infinite alternate',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        zoom: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.1)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(201, 164, 92, 0.4)',
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(201, 164, 92, 0.6), 0 0 60px rgba(201, 164, 92, 0.3)',
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [
    ({ addComponents, addUtilities }) => {
      addComponents({
        // Premium glass panel
        '.glass-panel': {
          '@apply bg-card/90 backdrop-blur-xl border border-white/5 shadow-wood-md rounded-2xl': {},
        },
        // Wood button primary
        '.btn-primary': {
          '@apply inline-flex items-center justify-center gap-2 px-6 py-3 font-sans font-semibold text-base rounded-xl transition-all duration-300': {},
          '@apply bg-gradient-to-br from-wood-amber-dark to-wood-amber text-base shadow-wood-glow': {},
          '@apply hover:shadow-wood-glow-lg hover:-translate-y-0.5 hover:brightness-110': {},
          '@apply active:scale-[0.98] active:translate-y-0': {},
          '@apply disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none': {},
        },
        // Wood button secondary (outline)
        '.btn-secondary': {
          '@apply inline-flex items-center justify-center gap-2 px-6 py-3 font-sans font-semibold text-wood-amber rounded-xl transition-all duration-300': {},
          '@apply bg-transparent border-2 border-wood-amber': {},
          '@apply hover:bg-wood-amber/10 hover:border-wood-amber-light hover:shadow-wood-glow hover:-translate-y-0.5': {},
          '@apply active:scale-[0.98]': {},
        },
        // Premium card
        '.card-premium': {
          '@apply bg-gradient-to-b from-card to-surface border border-white/5 rounded-2xl shadow-wood-sm transition-all duration-300': {},
          '@apply hover:border-wood-amber/20 hover:shadow-wood-md hover:-translate-y-1': {},
        },
        // Input field
        '.input-premium': {
          '@apply w-full p-4 font-sans text-white bg-surface border border-white/10 rounded-xl outline-none transition-all duration-200': {},
          '@apply placeholder:text-muted': {},
          '@apply hover:border-wood-amber/30': {},
          '@apply focus:border-wood-amber focus:ring-2 focus:ring-wood-amber/20': {},
        },
      });
      addUtilities({
        '.text-gradient-amber': {
          'background': 'linear-gradient(135deg, #dbb978 0%, #c9a45c 50%, #a8834a 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
      });
    },
  ],
};
