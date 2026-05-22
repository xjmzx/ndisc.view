/** @type {import('tailwindcss').Config} */

// Themeable palette — values come from CSS custom properties in src/index.css.
// The channel-triple form keeps Tailwind's /opacity modifiers working
// (e.g. bg-mauve/15 → rgb(var(--c-mauve) / 0.15)).
const c = (v) => `rgb(var(${v}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: c("--c-bg"),
        surface: c("--c-surface"),
        surfaceHover: c("--c-surface-hover"),
        fg: c("--c-fg"),
        muted: c("--c-muted"),
        accent: c("--c-accent"),
        mauve: c("--c-mauve"),
        // Medium badges — physical green, digital blue.
        physical: c("--c-physical"),
        digital: c("--c-digital"),
      },
      fontFamily: {
        sans: ["Helvetica", "Arial", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
