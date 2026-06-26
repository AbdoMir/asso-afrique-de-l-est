import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#E8702A',
          600: '#d05a1a',
          700: '#b44514',
          800: '#92370f',
          900: '#7c2d12',
          950: '#431407',
        },
        secondary: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#2D7D46',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        accent: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#F4A935',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        warm: {
          50:  '#FEFAF5',
          100: '#F5F0E8',
          200: '#EDE4D4',
          300: '#DDD3BE',
          400: '#C8BAA0',
          500: '#B09C80',
          600: '#8F7C60',
          700: '#6B5C43',
          800: '#4A3F2E',
          900: '#2A2319',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'count-up': 'countUp 2s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #E8702A 0%, #F4A935 50%, #2D7D46 100%)',
        'gradient-hero': 'linear-gradient(160deg, rgba(232,112,42,0.08) 0%, rgba(244,169,53,0.06) 50%, rgba(45,125,70,0.08) 100%)',
        'gradient-card': 'linear-gradient(145deg, #FEFAF5 0%, #F5F0E8 100%)',
      },
      boxShadow: {
        'warm': '0 4px 24px -4px rgba(232,112,42,0.15)',
        'warm-lg': '0 12px 40px -8px rgba(232,112,42,0.2)',
        'card': '0 2px 16px -2px rgba(26,26,26,0.08)',
        'card-hover': '0 8px 32px -4px rgba(26,26,26,0.12)',
        'blob': '0 24px 64px -12px rgba(26,26,26,0.22)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}

export default config
