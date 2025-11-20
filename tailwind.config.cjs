const PrimeUI = require('tailwindcss-primeui');

module.exports = {
  content: [
    './public/index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [PrimeUI],
};