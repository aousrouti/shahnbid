import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1A56A3',
          mid:     '#3B7DD8',
          light:   '#E8F0FB',
          navy:    '#1C2B4A',
          bg:      '#F5F8FE',
          border:  '#D0DCF0',
        },
        status: {
          success: '#0F6E56',
          warning: '#BA7517',
          danger:  '#A32D2D',
          grey:    '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        badge: '4px',
        input: '8px',
        card:  '12px',
        modal: '16px',
      },
    },
  },
  plugins: [],
};

export default config;
