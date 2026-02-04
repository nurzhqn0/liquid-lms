/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"] ,
  theme: {
    extend: {
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Space Grotesk", "sans-serif"]
      },
      colors: {
        ink: "#1f2937",
        sand: "#f6f2e9",
        clay: "#e7dbc9",
        teal: "#1b7f7a",
        ember: "#f59e0b"
      },
      boxShadow: {
        glow: "0 12px 40px -20px rgba(27,127,122,0.5)"
      }
    }
  },
  plugins: []
};
