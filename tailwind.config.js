/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ed',
          100: '#fdedd3',
          200: '#fbd9a5',
          300: '#f8c06d',
          400: '#f4a233',
          500: '#f1890d',
          600: '#c9a876',
          700: '#a68b5b',
          800: '#8c7c5b',
          900: '#6b5b47',
        },
        gold: {
          100: '#fef3c7',
          800: '#92400e',
        }
      },
      fontFamily: {
        'cormorant': ['Cormorant Garamond', 'serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};
