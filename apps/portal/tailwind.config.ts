import type { Config } from 'tailwindcss';

// Design tokens mapped from original styles.css (oklch → CSS variables)
const config: Config = {
  darkMode:  ['class'],
  content:   ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './hooks/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1.75rem', screens: { '2xl': '1400px' } },
    extend: {
      // CSS variable colors — use var() so they work with oklch tokens
      colors: {
        border:      'var(--line)',
        input:       'var(--line)',
        ring:        'oklch(0.58 0.13 250)',
        background:  'var(--bg)',
        foreground:  'var(--ink)',
        primary:     { DEFAULT: 'var(--ink)',      foreground: 'oklch(0.99 0 0)' },
        secondary:   { DEFAULT: 'var(--surface-3)', foreground: 'var(--ink-2)' },
        destructive: { DEFAULT: 'var(--bad)',       foreground: 'oklch(0.99 0 0)' },
        muted:       { DEFAULT: 'var(--surface-2)', foreground: 'var(--ink-3)' },
        accent:      { DEFAULT: 'var(--surface-3)', foreground: 'var(--ink)' },
        popover:     { DEFAULT: 'var(--surface)',   foreground: 'var(--ink)' },
        card:        { DEFAULT: 'var(--surface)',   foreground: 'var(--ink)' },
        // Semantic palette exposed as Tailwind utilities
        'vmp-ok':       'var(--ok)',
        'vmp-ok-soft':  'var(--ok-soft)',
        'vmp-warn':     'var(--warn)',
        'vmp-warn-soft':'var(--warn-soft)',
        'vmp-bad':      'var(--bad)',
        'vmp-bad-soft': 'var(--bad-soft)',
        'vmp-info':     'var(--info)',
        'vmp-info-soft':'var(--info-soft)',
        'ink':   'var(--ink)',
        'ink-2': 'var(--ink-2)',
        'ink-3': 'var(--ink-3)',
        'ink-4': 'var(--ink-4)',
        'surface':   'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        'line':       'var(--line)',
        'line-strong':'var(--line-strong)',
        'vmp-accent':       'oklch(0.58 0.13 250)',
        'vmp-accent-soft':  'var(--accent-soft)',
        'vmp-accent-strong':'var(--accent-strong)',
      },
      fontSize: {
        // Match original 13px base with compact scale
        xs:   ['10.5px', { lineHeight: '1.4' }],
        sm:   ['11.5px', { lineHeight: '1.45' }],
        base: ['13px',   { lineHeight: '1.45' }],
        md:   ['12.5px', { lineHeight: '1.45' }],
        lg:   ['14px',   { lineHeight: '1.45' }],
        xl:   ['16px',   { lineHeight: '1.4' }],
        '2xl':['20px',   { lineHeight: '1.3' }],
        '3xl':['22px',   { lineHeight: '1.2' }],
        '4xl':['28px',   { lineHeight: '1.15' }],
      },
      borderRadius: {
        sm:  'var(--radius-sm)',   // 5px
        DEFAULT: 'var(--radius)', // 8px
        md:  'var(--radius)',      // 8px
        lg:  'var(--radius-lg)',   // 12px
        xl:  '16px',
        full:'999px',
      },
      spacing: {
        // Extra-compact spacing for dense UI
        '4.5': '18px',
        '5.5': '22px',
        '6.5': '26px',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        sm:  'var(--shadow-sm)',
        DEFAULT:'var(--shadow)',
        lg:  'var(--shadow-lg)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'pulse-dot':      { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.3' } },
        'slide-in':       { from: { transform: 'translateX(40px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        'fade-in':        { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'pulse-dot':      'pulse-dot 1.8s ease-in-out infinite',
        'slide-in':       'slide-in 0.25s ease-out',
        'fade-in':        'fade-in 0.15s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
