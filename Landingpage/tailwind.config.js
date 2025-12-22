/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        gblue: '#4285F4',
        gred: '#DB4437',
        gyellow: '#F4B400',
        ggreen: '#0F9D58',
        offwhite: '#F0F0F0',
        offblack: '#121212',
        'cool-bg': '#60A5FA',
        'cool-bg-light': '#BFDBFE',
        'cool-dark': '#1e3a8a',
      },
      boxShadow: {
        'neo': '5px 5px 0px 0px rgba(0,0,0,1)',
        'neo-dark': '5px 5px 0px 0px rgba(255,255,255,1)',
        'neo-sm': '3px 3px 0px 0px rgba(0,0,0,1)',
        'neo-sm-dark': '3px 3px 0px 0px rgba(255,255,255,1)',
        'neo-lg': '8px 8px 0px 0px rgba(0,0,0,1)',
        'neo-lg-dark': '8px 8px 0px 0px rgba(255,255,255,1)',
      }
    },
  },
  plugins: [],
}