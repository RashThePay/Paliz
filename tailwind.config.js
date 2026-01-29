/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media',   // ← or 'media' if you prefer system preference only
  theme: {
    extend: {
      colors: {
        // Optional: define semantic colors (very recommended)
        bg: {
          primary: 'hsl(0 0% 100%)',     // light
          secondary: 'hsl(0 0% 98%)',
        },
        text: {
          primary: 'hsl(0 0% 4%)',
          secondary: 'hsl(0 0% 30%)',
        },
        // ... more colors
      },
    },
  },
  plugins: [],
}