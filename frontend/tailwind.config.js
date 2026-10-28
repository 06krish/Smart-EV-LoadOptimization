/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#00C2A8',
          50: '#E6FAF7',
          100: '#C7F5EF',
          200: '#94ECE0',
          300: '#52DFCE',
          400: '#1ED3BE',
          500: '#00C2A8',
          600: '#00A38D',
          700: '#008472',
          800: '#006659',
          900: '#004A41',
        },
        indigo: {
          DEFAULT: '#2E3A8C',
          50: '#F0F2FA',
          100: '#E1E5F5',
          200: '#C5CDEB',
          300: '#9DAADE',
          400: '#6E81CE',
          500: '#465ABB',
          600: '#2E3A8C',
          700: '#242E70',
          800: '#1C2456',
          900: '#141A3E',
        },
        lime: {
          DEFAULT: '#A3E635',
          50: '#F7FEE7',
          100: '#ECFCCB',
          200: '#D9F99D',
          300: '#BEF264',
          400: '#A3E635',
          500: '#84CC16',
          600: '#65A30D',
          700: '#4D7C0F',
        },
        amber: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        coral: {
          DEFAULT: '#EF4444',
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
        },
        slate: {
          850: '#172033',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(46, 58, 140, 0.06)',
        'soft-hover': '0 8px 30px rgba(46, 58, 140, 0.12)',
        'card': '0 2px 12px rgba(46, 58, 140, 0.04)',
        'teal-glow': '0 0 16px rgba(0, 194, 168, 0.4)',
        'teal-glow-lg': '0 0 28px rgba(0, 194, 168, 0.6)',
        'amber-glow': '0 0 16px rgba(245, 158, 11, 0.35)',
      },
      keyframes: {
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.6, transform: 'scale(1.08)' },
        },
        'breathe': {
          '0%, 100%': { transform: 'scale(1)', opacity: 0.9 },
          '50%': { transform: 'scale(1.12)', opacity: 1 },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'shimmer': 'shimmer 2.2s infinite ease-in-out',
        'pulse-glow': 'pulse-glow 2s infinite ease-in-out',
        'breathe': 'breathe 2.5s infinite ease-in-out',
        'fade-up': 'fade-up 0.4s ease-out forwards',
      }
    },
  },
  plugins: [],
}
