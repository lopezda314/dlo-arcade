/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', ' Cambria', '"Times New Roman"', 'serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        paper: {
          DEFAULT: '#FAF7F0',
          warm: '#F3EDE0',
          card: '#FFFFFF',
          ink: '#171614',
          muted: '#6E6A63',
        },
        dlo: {
          emerald: '#0F9F6E',
          amber: '#E88B00',
          sky: '#0284C7',
          violet: '#7C3AED',
          coral: '#E11D48',
        },
      },
      boxShadow: {
        tactile: '0 4px 0 0 #171614',
        'tactile-sm': '0 2px 0 0 #171614',
        'tactile-lg': '0 6px 0 0 #171614',
        'tactile-active': '0 1px 0 0 #171614',
      },
    },
  },
  plugins: [],
};
