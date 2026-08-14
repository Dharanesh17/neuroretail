/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#2563EB', // Deep Blue Primary
          600: '#1D4ED8',
          700: '#1E40AF',
        },
        indigoBrand: {
          500: '#4F46E5', // Secondary Indigo
          600: '#4338CA',
        },
        corporate: {
          bg: '#FFFFFF',
          card: '#F8FAFC',
          border: '#E5E7EB',
          text: '#1F2937',
          muted: '#6B7280',
          hover: '#F1F5F9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
