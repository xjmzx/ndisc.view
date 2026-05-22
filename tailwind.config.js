/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0e13",
        surface: "#131d2a",
        surfaceHover: "#1e2d3d",
        fg: "#f0f6fc",
        muted: "#6b7a8d",
        accent: "#7af0cd",
        mauve: "#a78bfa",
      },
      fontFamily: {
        sans: ["Helvetica", "Arial", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
