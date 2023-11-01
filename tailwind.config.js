/* eslint-disable global-require */
/** @type {import("@types/tailwindcss/tailwind-config").TailwindConfig } */
module.exports = {
  mode: 'jit',
  content: ['./src/webviews/**/*.{js,jsx,ts,tsx,css}'],
  darkMode: ['class', '[data-mode="dark"]'], // or 'media' or 'class'
  theme: {
    extend: {
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@githubocto/tailwind-vscode'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
