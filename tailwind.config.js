/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0B0E14',
          surface: '#141824',
          raised: '#1C2130',
          border: '#272E42',
        },
        brand: {
          DEFAULT: '#3DDC97',
          dim: '#1F5C43',
          soft: 'rgba(61, 220, 151, 0.14)',
        },
        gasto: {
          DEFAULT: '#FB5A6B',
          soft: 'rgba(251, 90, 107, 0.14)',
        },
        ingreso: {
          DEFAULT: '#3DDC97',
          soft: 'rgba(61, 220, 151, 0.14)',
        },
        ambar: {
          DEFAULT: '#F5A623',
          soft: 'rgba(245, 166, 35, 0.14)',
        },
        violet: {
          DEFAULT: '#8B7CF6',
          soft: 'rgba(139, 124, 246, 0.14)',
        },
        muted: '#8B93A7',
      },
      fontFamily: {
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.5)',
        glow: '0 0 0 1px rgba(61,220,151,0.25), 0 8px 30px -8px rgba(61,220,151,0.35)',
        pop: '0 20px 60px -20px rgba(0,0,0,0.6)',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        popIn: {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        floatSlow: 'floatSlow 5s ease-in-out infinite',
        popIn: 'popIn 0.3s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
}
