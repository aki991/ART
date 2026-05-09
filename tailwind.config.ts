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
        sidebar: {
          DEFAULT: "#0A1B2C",
          deep: "#061320",
          hover: "#0F2438",
        },
      },
      fontFamily: {
        orbitron: ["var(--font-orbitron)", "sans-serif"],
        rajdhani: ["var(--font-rajdhani)", "sans-serif"],
        jetbrains: ["var(--font-jetbrains)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
