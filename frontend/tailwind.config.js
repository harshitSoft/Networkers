export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          base: "rgb(var(--bg-base) / <alpha-value>)",
          panel: "rgb(var(--bg-panel) / <alpha-value>)",
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
          accent: "rgb(var(--accent) / <alpha-value>)",
          deep: "rgb(var(--accent-deep) / <alpha-value>)",
          border: "rgb(var(--border) / <alpha-value>)"
        },
        ink: "#070b18",
        panel: "#101729",
        violet: "#7c3aed",
        networkRed: "#E8262A",
        networkDeep: "#B91C1C",
        charcoal: "#4D4D4D",
        trueBlack: "#1A1A1A",
        softGray: "#F5F5F5"
      },
      boxShadow: {
        glow: "0 20px 60px rgba(232,38,42,.22)",
        premium: "0 18px 45px rgba(26,26,26,.08)"
      }
    }
  },
  plugins: []
};
