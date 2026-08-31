/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f8f5',
          100: '#e1efe9',
          500: '#1e5e45',
          700: '#0f3828',
          800: '#0a261b',
          900: '#061a12',
        }
      }
    },
  },
  plugins: [],
}