/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563EB', 50: '#EFF6FF', 100: '#DBEAFE', 500: '#3B82F6', 600: '#2563EB', 700: '#1D4ED8' },
        success: { DEFAULT: '#16A34A', 50: '#F0FDF4', 500: '#22C55E', 600: '#16A34A' },
        warning: { DEFAULT: '#D97706', 50: '#FFFBEB', 500: '#F59E0B', 600: '#D97706' },
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      borderRadius: { card: '8px', btn: '4px' },
      spacing: { base: '8px' },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}

