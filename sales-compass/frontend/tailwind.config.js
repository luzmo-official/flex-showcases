/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          400: 'var(--color-primary-lighter)',
          600: 'var(--color-primary-darker)',
          inverse: 'var(--color-primary-inverse)',
          5: 'rgba(var(--color-primary-rgb), 0.05)',
          10: 'rgba(var(--color-primary-rgb), 0.1)',
          20: 'rgba(var(--color-primary-rgb), 0.2)',
          30: 'rgba(var(--color-primary-rgb), 0.3)',
          40: 'rgba(var(--color-primary-rgb), 0.4)',
          50: 'rgba(var(--color-primary-rgb), 0.5)',
          60: 'rgba(var(--color-primary-rgb), 0.6)',
          70: 'rgba(var(--color-primary-rgb), 0.7)',
          80: 'rgba(var(--color-primary-rgb), 0.8)',
          90: 'rgba(var(--color-primary-rgb), 0.9)'
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          400: 'var(--color-secondary-lighter)',
          600: 'var(--color-secondary-darker)',
          inverse: 'var(--color-secondary-inverse)',
          5: 'rgba(var(--color-secondary-rgb), 0.05)',
          10: 'rgba(var(--color-secondary-rgb), 0.1)',
          20: 'rgba(var(--color-secondary-rgb), 0.2)',
          30: 'rgba(var(--color-secondary-rgb), 0.3)',
          40: 'rgba(var(--color-secondary-rgb), 0.4)',
          50: 'rgba(var(--color-secondary-rgb), 0.5)',
          60: 'rgba(var(--color-secondary-rgb), 0.6)',
          70: 'rgba(var(--color-secondary-rgb), 0.7)',
          80: 'rgba(var(--color-secondary-rgb), 0.8)',
          90: 'rgba(var(--color-secondary-rgb), 0.9)'
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          600: 'var(--color-danger-darker)',
          inverse: 'var(--color-danger-inverse)'
        },
        success: {
          DEFAULT: 'var(--color-success)',
          600: 'var(--color-success-darker)',
          inverse: 'var(--color-success-inverse)'
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          raised: 'var(--color-surface-raised)'
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif']
      },
      textColor: {
        dimmed: 'var(--color-text-dimmed)',
        default: 'var(--color-text)',
        active: 'var(--color-text-active)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)'
      },
      borderColor: {
        light: 'var(--color-border-light)',
        default: 'var(--color-border)',
        hard: 'var(--color-border-hard)'
      },
      borderRadius: {
        DEFAULT: 'var(--border-radius-default)',
        sm: 'var(--border-radius-small)',
        lg: 'var(--border-radius-large)',
        full: 'var(--border-radius-full)'
      },
      keyframes: {
        'pulse-primary': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(var(--color-primary-rgb), 0.4)'
          },
          '50%': { boxShadow: '0 0 0 4px rgba(var(--color-primary-rgb), 0.1)' }
        }
      },
      animation: {
        'pulse-primary': 'pulse-primary 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      screens: {
        // Use only 3 breakpoints: "mobile", "small laptop screen", "larger desktop screen"
        md: '768px',
        lg: '1200px',
        xl: '1600px'
      }
    }
  },
  plugins: []
};
