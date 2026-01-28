/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,njk,md}"],
  theme: {
    extend: {
      colors: {
        "acid-green": "#ccff00",
        "raw-paper": "#f0f0f0",
        "raw-black": "#1a1a1a",
      },
      fontFamily: {
        header: ["Oswald", "sans-serif"],
        body: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
