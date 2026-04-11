/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy colors for backward compatibility
        'custom-yellow': '#F72585',
        'custom-dark-yellow': '#7209B7',
        'custom-light-yellow': 'rgba(247, 37, 133, 0.1)',
        // Cosmic color palette
        'cosmic': {
          'deep-space': '#03071E',
          'void': '#000000',
          'purple': '#7209B7',
          'pink': '#F72585',
          'cyan': '#4CC9F0',
          'gold': '#FFD700',
          'text': '#F8F9FA',
          'star': '#FFFFFF',
          'nebula': {
            'pink': 'rgba(247, 37, 133, 0.3)',
            'purple': 'rgba(114, 9, 183, 0.4)',
            'cyan': 'rgba(76, 201, 240, 0.3)',
          }
        },
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'orbit': 'orbit 30s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(247, 37, 133, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(247, 37, 133, 0.6)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(100px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(100px) rotate(-360deg)' },
        },
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(135deg, #03071E 0%, #7209B7 50%, #03071E 100%)',
        'nebula-gradient': 'radial-gradient(ellipse at center, rgba(114, 9, 183, 0.4) 0%, rgba(3, 7, 30, 0.8) 50%, #03071E 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      },
      boxShadow: {
        'cosmic': '0 0 30px rgba(114, 9, 183, 0.5), 0 0 60px rgba(247, 37, 133, 0.3)',
        'neon-pink': '0 0 10px rgba(247, 37, 133, 0.8), 0 0 20px rgba(247, 37, 133, 0.4)',
        'neon-cyan': '0 0 10px rgba(76, 201, 240, 0.8), 0 0 20px rgba(76, 201, 240, 0.4)',
        'neon-gold': '0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      },
      backdropBlur: {
        'glass': '16px',
      },
      borderRadius: {
        'cosmic': '20px',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#F8F9FA',
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
