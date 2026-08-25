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
        wedding: {
          50: '#fff5f5',
          100: '#ffe3e3',
          200: '#ffc9c9',
          300: '#ffa8a8',
          400: '#ff8787',
          500: '#ff6b6b',
          600: '#fa5252',
          700: '#f03e3e',
          800: '#e03131',
          900: '#c92a2a',
        },
        roseGold: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#b76e79',
          600: '#a35d68',
          700: '#8c4e57',
        },
        champagne: {
          50: '#fdfbf7',
          100: '#f7f2e7',
          200: '#efe5cf',
          300: '#e3d2ad',
          400: '#d5bd88',
          500: '#c5a059',
          600: '#b08b46',
        }
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
        serif: ['Nanum Myeongjo', 'Batang', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(183, 110, 121, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
        'floating': '0 20px 40px -15px rgba(183, 110, 121, 0.25)',
      }
    },
  },
  plugins: [],
}
