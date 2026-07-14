export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#070b18",
        panel: "#101729",
        brand: "#E8262A",
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
