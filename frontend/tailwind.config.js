/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        soccerDark: '#0f172a',
        soccerCard: '#1e293b',
        soccerGreen: '#10b981',
      },
    },
  },
  corePlugins: {
    // Disable Tailwind's base reset — Ionic manages its own base styles
    preflight: false,
  },
  plugins: [],
};
