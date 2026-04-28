/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        barber: {
          dark: '#0f0f0f',
          darker: '#080808',
          gold: '#c9a84c',
          goldLight: '#e0c068',
          goldDark: '#a08030',
          gray: '#1a1a1a',
          grayLight: '#2a2a2a',
          grayLighter: '#3a3a3a',
          text: '#e0e0e0',
          textMuted: '#888888',
          success: '#4ade80',
          danger: '#f87171',
          warning: '#fbbf24',
          info: '#60a5fa',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
