import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: "#0b0c10",
          900: "#12141a",
          850: "#161821",
          800: "#1d202b",
          700: "#272a38",
          600: "#363b4e",
          500: "#4b516a",
        },
        brand: {
          purple: {
            light: "#c4b5fd",
            DEFAULT: "#8b5cf6",
            dark: "#6d28d9",
            glow: "rgba(139, 92, 246, 0.12)",
          },
          green: {
            light: "#6ee7b7",
            DEFAULT: "#10b981",
            dark: "#047857",
            glow: "rgba(16, 185, 129, 0.12)",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;

