/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'drmaha-primary': '#E4B8AE',
        'drmaha-secondary': '#F7CCC5',
        'drmaha-dark': '#C49289',
        'drmaha-light': '#FAE7E2',
      },
      screens: {
        'xs': '475px',
      }
    },
  },
  plugins: [],
}