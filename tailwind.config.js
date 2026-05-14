/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        indigo: {
          50:  '#EEF2FF', 100: '#E0E7FF', 200: '#C7D2FE', 300: '#A5B4FC',
          400: '#818CF8', 500: '#6366F1', 600: '#4F46E5', 700: '#4338CA',
          800: '#3730A3', 900: '#312E81',
        },
        slate: {
          50:  '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1',
          400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155',
          800: '#1E293B', 900: '#0F172A', 950: '#020617',
        },
        success: { 50: '#ECFDF5', 100: '#D1FAE5', 500: '#10B981', 600: '#059669', 700: '#047857' },
        danger:  { 50: '#FEF2F2', 100: '#FEE2E2', 500: '#EF4444', 600: '#DC2626', 700: '#B91C1C' },
        warning: { 50: '#FFFBEB', 100: '#FEF3C7', 500: '#F59E0B', 600: '#D97706', 700: '#B45309' },
        info:    { 50: '#EFF6FF', 100: '#DBEAFE', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8' },
      },

      spacing: {
        '1': '4px',   '2': '8px',   '3': '12px',  '4': '16px', '5': '20px',
        '6': '24px',  '8': '32px',  '10': '40px', '12': '48px',
        '16': '64px', '20': '80px', '24': '96px',
      },

      screens: {
        sm: '768px',
        lg: '1440px',
      },

      fontFamily: {
        display: ['Geist', 'sans-serif'],
        sans:    ['Geist', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono:    ['"Geist Mono"', 'monospace'],
      },

      fontSize: {
        'display-xl': ['32px', { lineHeight: '1.18', letterSpacing: '-0.025em', fontWeight: '600' }],
        'display-lg': ['28px', { lineHeight: '1.2',  letterSpacing: '-0.025em', fontWeight: '600' }],
        'h1':         ['24px', { lineHeight: '1.25', letterSpacing: '-0.02em',  fontWeight: '600' }],
        'h2':         ['20px', { lineHeight: '1.3',  letterSpacing: '-0.02em',  fontWeight: '600' }],
        'h3':         ['18px', { lineHeight: '1.4',  letterSpacing: '-0.015em', fontWeight: '600' }],
        'body-lg':    ['15px', { lineHeight: '1.6' }],
        'body':       ['14px', { lineHeight: '1.6' }],
        'body-sm':    ['13px', { lineHeight: '1.5' }],
        'caption':    ['12px', { lineHeight: '1.5' }],
        'micro':      ['11px', { lineHeight: '1.4',  letterSpacing: '0.08em', fontWeight: '600' }],
      },

      borderRadius: {
        'xs':  '4px',
        'sm':  '6px',
        'DEFAULT': '8px',
        'md':  '8px',
        'lg':  '10px',
        'xl':  '12px',
        '2xl': '16px',
      },

      boxShadow: {
        sm: '0 1px 2px rgba(15,23,42,0.04)',
        md: '0 1px 3px rgba(15,23,42,0.05), 0 4px 12px rgba(15,23,42,0.04)',
        lg: '0 4px 12px rgba(15,23,42,0.06), 0 12px 32px rgba(15,23,42,0.06)',
        xl: '0 12px 32px rgba(15,23,42,0.08), 0 24px 48px rgba(15,23,42,0.08)',
        focus: '0 0 0 3px rgba(99,102,241,0.15)',
        error: '0 0 0 3px rgba(239,68,68,0.12)',
      },

      height: {
        'btn-sm': '28px',
        'btn-md': '36px',
        'btn-lg': '44px',
      },

      transitionDuration: {
        fast: '120ms',
        base: '200ms',
        slow: '320ms',
      },

      transitionTimingFunction: {
        standard:   'cubic-bezier(0.2, 0.7, 0.3, 1)',
        decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
        accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
      },

      backgroundImage: {
        'ritual-morning': 'linear-gradient(180deg, #EEF2FF 0%, #FAFAFB 60%)',
        'ritual-evening': 'linear-gradient(180deg, #E0E7FF 0%, #F8FAFC 60%)',
      },

      keyframes: {
        spin:    { to: { transform: 'rotate(360deg)' } },
        blink:   { '50%': { opacity: '0' } },
        shimmer: { '0%, 100%': { opacity: '0.7' }, '50%': { opacity: '1' } },
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
      },
      animation: {
        spin:    'spin 700ms linear infinite',
        blink:   'blink 1.1s infinite',
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        fadeIn:  'fadeIn 200ms ease-out',
        slideUp: 'slideUp 320ms cubic-bezier(0.2, 0.7, 0.3, 1)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
