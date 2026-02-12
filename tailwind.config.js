/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'neon-green': '#39FF14',
        'neon-blue': '#00D4FF',
        'neon-purple': '#C277FF'
      },
      boxShadow: {
        'neon-green': '0 0 18px rgba(57,255,20,0.14)'
      }
    }
  },
  plugins: []
};
