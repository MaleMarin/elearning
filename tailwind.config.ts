import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#F6F1E8",
          warm: "#efe9df",
          dark: "#e6e0d5",
        },
        primary: "#7569DE",
        coral: "#FE6845",
        amber: "#FFA046",
        ink: "#1F2430",
      },
      fontSize: { base: ["18px", { lineHeight: "1.6" }] },
      boxShadow: {
        soft: "0 2px 8px rgba(31, 36, 48, 0.06), 0 1px 2px rgba(31, 36, 48, 0.04)",
        "soft-lg": "0 4px 16px rgba(31, 36, 48, 0.08), 0 2px 4px rgba(31, 36, 48, 0.04)",
        e0: "0 0 0 rgba(0,0,0,0)",
        e1: "0 10px 30px rgba(31,36,48,0.08)",
        e2: "0 18px 50px rgba(31,36,48,0.10)",
        e3: "0 26px 70px rgba(31,36,48,0.12)",
        insetHi: "inset 0 1px 0 rgba(255,255,255,0.70)",
        "e1-inset": "inset 0 1px 0 rgba(255,255,255,0.70), 0 10px 30px rgba(31,36,48,0.08)",
        "e2-inset": "inset 0 1px 0 rgba(255,255,255,0.70), 0 18px 50px rgba(31,36,48,0.10)",
        "elevation-0": "none",
        "elevation-1": "0 1px 0 0 rgba(255,255,255,0.7) inset, 0 2px 8px rgba(31,36,48,0.06), 0 1px 2px rgba(31,36,48,0.04)",
        "elevation-2": "0 1px 0 0 rgba(255,255,255,0.8) inset, 0 4px 16px rgba(31,36,48,0.08), 0 2px 4px rgba(31,36,48,0.04)",
        "elevation-3": "0 1px 0 0 rgba(255,255,255,0.9) inset, 0 8px 24px rgba(31,36,48,0.10), 0 2px 8px rgba(31,36,48,0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
