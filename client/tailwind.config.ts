import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dmsans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          green: '#3E5219',
          olive: '#556B2F',
          textDark: '#45483C',
          navText: '#121C2A',
          bgLight: '#F8F9FF',
          statsBg: '#EFF4FF',
          btnBlue: '#D9E3F6',
          borderLight: '#C5C8B8',
          glassBg: 'rgba(221, 229, 211, 0.4)',
          glassBorder: 'rgba(199, 210, 192, 0.5)',
        }
      },
    },
  },
  plugins: [],
}
export default config;
