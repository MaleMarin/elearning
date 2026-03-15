import type { Config } from "tailwindcss";

/**
 * Sistema visual base — Precisar e-learning.
 * No extender con colores, sombras ni radios fuera de este sistema.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Avenir Light",
          "Avenir Next",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      colors: {
        bg: "#f0f2f5",
        surface: "#f0f2f5",
        "surface-soft": "#f0f2f5",
        ink: "#1428d4",
        muted: "#6b7280",
        line: "rgba(20,40,212,0.1)",
        primary: {
          DEFAULT: "#1428d4",
          soft: "rgba(20,40,212,0.08)",
          hover: "#2b4fff",
        },
        accent: {
          DEFAULT: "#00e5a0",
          soft: "rgba(0,229,160,0.12)",
          hover: "#00b87d",
        },
        success: {
          DEFAULT: "#00b87d",
          soft: "rgba(0,229,160,0.12)",
        },
        coral: {
          DEFAULT: "#DC2626",
          soft: "#FEF2F2",
          hover: "#B91C1C",
        },
        amber: {
          DEFAULT: "#F59E0B",
          soft: "#FFFBEB",
        },
        sidebar: "#F1F5F9",
      },
      fontSize: {
        base: ["18px", { lineHeight: "1.6" }],
      },
      borderRadius: {
        "card-lg": "24px",
        card: "20px",
        input: "16px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 10px 30px rgba(31,36,48,0.06)",
        "card-hover": "0 16px 40px rgba(31,36,48,0.08)",
        "card-inset": "inset 0 1px 0 rgba(255,255,255,0.65)",
        "sidebar": "0 2px 8px rgba(31,36,48,0.04)",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
