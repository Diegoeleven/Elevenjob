/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0b0b0b',
          contrast: '#212121',
        },
        secondary: '#bfbfbf',
        accent: '#00d8ff',
      },
      fontFamily: {
        'serif': ['Playfair Display', 'Georgia', 'Times New Roman', 'serif'],
        'script': ['Great Vibes', 'Dancing Script', 'Brush Script MT', 'cursive'],
      },
    },
  },
  plugins: [],
};