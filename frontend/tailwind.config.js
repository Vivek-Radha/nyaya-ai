/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      colors: {
        zinc: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
      },
      transitionDuration: {
        '1200': '1200ms',
      },
      transitionTimingFunction: {
        'bounce-sm': 'cubic-bezier(0.22,1,0.36,1)',
        'bounce-md': 'cubic-bezier(0.34,1.56,0.64,1)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
