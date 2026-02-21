/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          primary: '#0f0f0f',
          secondary: '#1a1a1a',
          tertiary: '#272727',
        },
        accent: {
          red: '#ff0000',
        },
      },
    },
  },
  plugins: [],
};
