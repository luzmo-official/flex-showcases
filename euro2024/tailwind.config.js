/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./src/**/*.{html,ts}",
    ".angular/**/*.{html,ts}",
  ],
  theme: {
    extend: {
    },
  },
  plugins: [],
}

