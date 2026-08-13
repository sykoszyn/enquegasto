import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        cs: {
          orange: "#ff7b00",
          orangeDark: "#c25f00",
          bg: "#0d0f12",
          panel: "#15181d",
          panel2: "#1c2027",
          border: "#262b33",
          text: "#e6e8eb",
          muted: "#8a919c"
        },
        hltv: {
          yellow: "#ffcc33",
          yellowDark: "#c9a01f"
        },
        faceit: {
          orange: "#ff5500"
        }
      },
      fontFamily: {
        display: ["'Rajdhani'", "'Arial Narrow'", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"]
      },
      boxShadow: {
        glow: "0 0 20px rgba(255, 123, 0, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
