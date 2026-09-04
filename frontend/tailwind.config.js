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
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-left': 'fadeInLeft 0.7s ease-out',
        'fade-in-right': 'fadeInRight 0.7s ease-out',
        'scale-up': 'scaleUp 0.6s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  corePlugins: {
    // Disable Tailwind's base reset — Ionic manages its own base styles
    preflight: false,
  },
  plugins: [
    // Plugin customizado para animation delays
    function({ addUtilities }) {
      addUtilities({
        '.delay-100': { 'animation-delay': '0.1s' },
        '.delay-200': { 'animation-delay': '0.2s' },
        '.delay-300': { 'animation-delay': '0.3s' },
        '.delay-400': { 'animation-delay': '0.4s' },
        '.delay-500': { 'animation-delay': '0.5s' },
        '.delay-600': { 'animation-delay': '0.6s' },
        '.delay-700': { 'animation-delay': '0.7s' },
        '.delay-800': { 'animation-delay': '0.8s' },
        '.delay-900': { 'animation-delay': '0.9s' },
        '.delay-1000': { 'animation-delay': '1s' },
        '.delay-1100': { 'animation-delay': '1.1s' },
        '.delay-1500': { 'animation-delay': '1.5s' },
      });
    },
  ],
};
