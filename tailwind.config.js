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
        charcoal: {
          950: '#0B0D13',
          900: '#11131B',
          850: '#161924',
          800: '#1C1F2E',
          750: '#23273A',
          700: '#2B3047',
          600: '#3D4464',
        },
        lavender: {
          50: '#FBF9FF',
          100: '#F3EFFF',
          200: '#E4DAFF',
          300: '#D0BCFF',
          400: '#B692F6',
          500: '#9B62F0',
          600: '#8338EC',
          700: '#6E1EE0',
        }
      },
      boxShadow: {
        'glow-purple': '0 0 35px -5px rgba(131, 56, 236, 0.25)',
        'glow-subtle': '0 0 20px -3px rgba(155, 98, 240, 0.15)',
      }
    },
  },
  plugins: [],
}
