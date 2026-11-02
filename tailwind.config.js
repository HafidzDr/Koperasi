/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          900: '#1B3320',
          800: '#24442B',
          700: '#2D5636',
          600: '#386B43',
          500: '#468353',
          100: '#EAF3EC',
          50: '#F4F8F5',
        },
        ink: {
          900: '#161616',
          800: '#262626',
          700: '#404040',
          600: '#525252',
          500: '#686868',
          300: '#D4D4D4',
          200: '#E5E5E5',
          100: '#F5F4F0',
          50: '#FAF9F6',
        },
        success: {
          700: '#1C5430',
          100: '#E6F4EA',
          base: '#2D7A46',
        },
        warning: {
          700: '#6B4700',
          100: '#FEF3D6',
          base: '#B45309',
        },
        danger: {
          700: '#7F1D1D',
          100: '#FEE2E2',
          base: '#B91C1C',
        },
        info: {
          700: '#1E3A5F',
          100: '#E8F0FE',
          base: '#2563EB',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};

