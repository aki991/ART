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
        "cyan-brand": "#00D2FF",
        "cyan-dark": "#0099C8",
        "cyan-bright": "#2EE0FF",
        "copper-brand": "#C79F64",
        "card-dark": "#0D2438",
        "card-dark-hover": "#1B324E",
        "modal-dark": "#0F2238",
        "app-surface": "#092D41",
        sidebar: {
          DEFAULT: "#0A1B2C",
          deep: "#061320",
          hover: "#0F2438",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist)", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-geist-mono)", "SF Mono", "Menlo", "Monaco", "Courier New", "monospace"],
        // Legacy aliases — redirect to Geist so existing font-rajdhani/orbitron classes still work
        rajdhani: ["var(--font-geist)", "system-ui", "sans-serif"],
        orbitron: ["var(--font-geist)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
