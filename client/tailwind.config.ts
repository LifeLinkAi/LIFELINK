import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#1a2e0a',
          800: '#2B4A18',
          600: '#3d6b1e',
          400: '#7AB648',
          50:  '#f3f9ea',
        },
        cream: '#F5F2E8',
      },
    },
  },
  plugins: [],
};

export default config;
