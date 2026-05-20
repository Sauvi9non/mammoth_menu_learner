/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        mammoth: {
          bg: "#F7F3EC",
          card: "#FFFFFF",
          ink: "#2A2017",
          sub: "#8A7B68",
          line: "#E7DECF",
          brand: "#7A1F1A",
          brandSoft: "#F0E2DA",
          hot: "#C0461F",
          ice: "#2F7DB0",
          iceBg: "#E5F0F7",
          hotBg: "#F8E7E0",
          new: "#1D7A52",
          newBg: "#E2F2EA",
          disc: "#9A8348",
          discBg: "#F3ECD8",
          warn: "#B5852A",
          warnBg: "#FBF1DB",
        },
      },
    },
  },
  plugins: [],
};
