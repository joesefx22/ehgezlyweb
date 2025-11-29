// tailwind.config.js
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        luxury: {
          50: "#f8fafc",
          100: "#eef2ff",
          500: "#0ea5a4",
          // custom palette for luxurious gradients
          deep: "#07112a",
          mid: "#0f172a",
          glow: "#334155",
          accent: "#6ee7b7",
          rose: "#fb7185",
          amber: "#f59e0b",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "Cairo", "sans-serif"]
      },
      boxShadow: {
        "lux-1": "0 10px 30px rgba(2,6,23,0.6)",
        "lux-2": "0 6px 18px rgba(6,10,25,0.5)",
      },
      borderRadius: {
        xl2: "1.25rem", // 20px
      }
    },
  },
  plugins: [],
}
