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
        bg: "#F3F2EF",
        surface: "#FFFFFF",
        "surface-soft": "#FAFAF8",
        ink: "#1F2430",
        muted: "#6B7280",
        line: "rgba(31,36,48,0.08)",
        primary: {
          DEFAULT: "#7569DE",
          soft: "#EEEAFD",
          hover: "#6355d4",
        },
        coral: {
          DEFAULT: "#FE6845",
          soft: "#FFF0EB",
          hover: "#e55a3a",
        },
        amber: {
          DEFAULT: "#FFA046",
          soft: "#FFF4E6",
        },
        success: {
          DEFAULT: "#9ECB45",
          soft: "#F3F9E7",
        },
        sidebar: "#EFEEE9",
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
