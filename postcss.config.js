// postcss.config.js
// Taken from: https://tailwindcss.com/docs/installation#using-tailwind-with-postcss
module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
  },
}
