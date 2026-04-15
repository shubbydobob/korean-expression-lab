import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        paper: "#f8f5ef",
        sage: "#6e8b74",
        clay: "#8f4f2f",
        accent: "#e9d8a6",
      },
      boxShadow: {
        panel: "0 24px 70px rgba(17, 24, 39, 0.12)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
    },
  },
  plugins: [],
};

export default config;
