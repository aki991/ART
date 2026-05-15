import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          app: "var(--bg-app)",
          surface: "var(--bg-surface)",
          "surface-elevated": "var(--bg-surface-elevated)",
          input: "var(--bg-input)",
          hover: "var(--bg-hover)",
          active: "var(--bg-active)",
          disabled: "var(--bg-disabled)",
          "success-light": "var(--bg-success-light)",
          "warning-light": "var(--bg-warning-light)",
          "error-light": "var(--bg-error-light)",
          "info-light": "var(--bg-info-light)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          disabled: "var(--text-disabled)",
          "on-accent": "var(--text-on-accent)",
        },
        accent: {
          DEFAULT: "var(--accent-primary)",
          hover: "var(--accent-primary-hover)",
          light: "var(--accent-primary-light)",
          text: "var(--accent-primary-text)",
        },
        border: {
          DEFAULT: "var(--border-default)",
          strong: "var(--border-strong)",
          subtle: "var(--border-subtle)",
        },
        status: {
          success: "var(--status-success)",
          warning: "var(--status-warning)",
          error: "var(--status-error)",
          info: "var(--status-info)",
        },
        // Legacy aliases kept for backward compatibility during migration
        "cyan-brand": "var(--accent-primary)",
        "cyan-dark": "var(--accent-primary-hover)",
        "cyan-bright": "var(--accent-primary)",
        "copper-brand": "#C79F64",
        "card-dark": "var(--bg-surface)",
        "card-dark-hover": "var(--bg-hover)",
        "modal-dark": "var(--bg-surface-elevated)",
        "app-surface": "var(--bg-app)",
        sidebar: {
          DEFAULT: "var(--bg-surface)",
          deep: "var(--bg-app)",
          hover: "var(--bg-hover)",
        },
      },
      backgroundImage: {
        "gradient-title": "var(--gradient-title)",
        "gradient-logo": "var(--gradient-logo)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      fontFamily: {
        sans: ["var(--font-geist)", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-geist-mono)", "SF Mono", "Menlo", "Monaco", "Courier New", "monospace"],
        rajdhani: ["var(--font-geist)", "system-ui", "sans-serif"],
        orbitron: ["var(--font-geist)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
