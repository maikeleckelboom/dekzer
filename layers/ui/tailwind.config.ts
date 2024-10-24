import animate from 'tailwindcss-animate'
import {materialThemeConfig} from './material.config'

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  safelist: ['dark'],
  prefix: '',
  content: [
    './layers/**/*.{vue,js,ts,jsx,tsx}',
    '../layers/ui/components/**/*.{vue,js,ts,jsx,tsx}',
    '../app/components/**/*.{vue,js,ts,jsx,tsx}',
    '../app/layouts/**/*.{vue,js,ts,jsx,tsx}',
    '../app/pages/**/*.{vue,js,ts,jsx,tsx}'
  ],
  plugins: [
    animate
  ],
  presets: [
    materialThemeConfig
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        surface: 'hsl(var(--surface))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
          'background-dark-rgb': 'rgb(var(--background-dark-rgb))',
          'on-background-dark-rgb': 'rgb(var(--on-background-dark-rgb))',
          'surface-dark-rgb': 'rgb(var(--surface-dark-rgb))',
          'surface-dim-dark-rgb': 'rgb(var(--surface-dim-dark-rgb))',
          'surface-bright-dark-rgb': 'rgb(var(--surface-bright-dark-rgb))',
          'surface-container-lowest-dark-rgb': 'rgb(var(--surface-container-lowest-dark-rgb))',
          'surface-container-low-dark-rgb': 'rgb(var(--surface-container-low-dark-rgb))',
          'surface-container-dark-rgb': 'rgb(var(--surface-container-dark-rgb))',
          'surface-container-high-dark-rgb': 'rgb(var(--surface-container-high-dark-rgb))',
          'surface-container-highest-dark-rgb': 'rgb(var(--surface-container-highest-dark-rgb))',
          'on-background-light-rgb': 'rgb(var(--on-background-light-rgb))',
          'surface-light-rgb': 'rgb(var(--surface-light-rgb))',
          'surface-dim-light-rgb': 'rgb(var(--surface-dim-light-rgb))',
          'surface-bright-light-rgb': 'rgb(var(--surface-bright-light-rgb))',
          'surface-container-lowest-light-rgb': 'rgb(var(--surface-container-lowest-light-rgb))',
          'surface-container-low-light-rgb': 'rgb(var(--surface-container-low-light-rgb))',
          'surface-container-light-rgb': 'rgb(var(--surface-container-light-rgb))',
          'surface-container-high-light-rgb': 'rgb(var(--surface-container-high-light-rgb))',
          'surface-container-highest-light-rgb': 'rgb(var(--surface-container-highest-light-rgb))'
        }
      },
      borderRadius: {
        xl: 'calc(var(--radius) + 4px)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 }
        },
        'collapsible-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-collapsible-content-height)' }
        },
        'collapsible-up': {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: 0 }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'collapsible-down': 'collapsible-down 0.2s ease-in-out',
        'collapsible-up': 'collapsible-up 0.2s ease-in-out'
      }
    }
  },
}
