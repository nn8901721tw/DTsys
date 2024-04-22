/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {pattern: /(bg|text|top|left)-./}
  ],
  theme: {
    extend: {
      fontFamily: {
        'press-start': ['Press Start 2P', 'cursive'],
        'Mulish': ['Mulish', 'sans-serif'],
      },
      colors:{
        'customgreen':'#00C8BB',
        'customgray':'#F6F5F8',
      },
      margin: {
        '-72': '-25rem',
                }
    },

  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
  variants: {
    scrollbar: ['rounded']
  }
};