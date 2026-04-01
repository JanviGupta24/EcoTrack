// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981', // Your main brand green
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        secondary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Your main brand blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      },
      
      // 1. NEW: Centralized Keyframe Definitions
      // We define the animations we use across the site here.
      keyframes: {
        fadeIn: {
          'from': { opacity: 0 },
          'to': { opacity: 1 },
        },
        slideInUp: {
          'from': { opacity: 0, transform: 'translateY(20px)' },
          'to': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      
      // 2. REFACTORED: Animation Utilities
      // We add our new animations here so we can use them
      // with classes like `animate-fadeIn`.
      animation: {
        // Your existing animations:
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        
        // Our new global animations:
        'fadeIn': 'fadeIn 0.5s ease-out forwards',
        'slideInUp': 'slideInUp 0.6s ease-out forwards',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },

  // 3. NEW: Professional Forms Plugin
  // This will automatically style your forms in Login, Register, etc.
  plugins: [
    require('@tailwindcss/forms'),
  ],
}