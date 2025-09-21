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
        gray: {
          850: '#1f2937',
        }
      },
      backgroundImage: {
  'card-dark-mode-gradient': 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)',
      },
    },
  },
  plugins: [],
}