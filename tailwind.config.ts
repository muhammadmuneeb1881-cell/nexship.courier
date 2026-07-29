import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#050505",
        surface: "#111111",
        card: "rgba(255,255,255,0.06)",
        border: "rgba(255,255,255,0.08)",
        accent: "#00FF88",
        muted: "#A0A0A0",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(20px, -20px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.06)" },
        },
        beam: {
          "0%": { transform: "translateX(-120%)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateX(120%)", opacity: "0" },
        },
        dashMove: {
          to: { strokeDashoffset: "-200" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      animation: {
        drift: "drift 9s ease-in-out infinite",
        pulseGlow: "pulseGlow 4s ease-in-out infinite",
        beam: "beam 6s linear infinite",
        dashMove: "dashMove 3.5s linear infinite",
        fadeUp: "fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        floaty: "floaty 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;