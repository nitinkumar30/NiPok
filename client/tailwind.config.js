/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        felt: {
          DEFAULT: '#0d5c2e',
          dark: '#0a4a24',
          light: '#1a7a3e'
        },
        poker: {
          black: '#1a1a2e',
          dark: '#16213e',
          gold: '#d4a843',
          red: '#e74c3c',
          green: '#2ecc71'
        },
        indian: {
          saffron: '#FF9933',
          green: '#138808',
          white: '#FFFFFF',
          chai: '#C68E4E',
          gulal: '#FF6B6B',
          mehendi: '#2D5A27'
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['Inter', 'sans-serif']
      },
      animation: {
        'deal': 'deal 0.5s ease-out',
        'flip': 'flip 0.6s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'chip-stack': 'chipStack 0.4s ease-out',
        'confetti': 'confetti 1s ease-out forwards',
        'spotlight': 'spotlight 0.5s ease-out'
      },
      keyframes: {
        deal: {
          '0%': { transform: 'translateY(-100px) rotate(-10deg)', opacity: '0' },
          '100%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' }
        },
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(212, 168, 67, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(212, 168, 67, 0.6)' }
        },
        chipStack: {
          '0%': { transform: 'translateY(-20px) scale(0.8)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' }
        }
      }
    }
  },
  plugins: []
}
