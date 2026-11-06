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
        aubergine: {
          DEFAULT: "#421224",
          50: "#f9f2f5",
          100: "#f2e4ea",
          200: "#e6cad7",
          300: "#d3a6be",
          400: "#b8769e",
          500: "#9b517f",
          600: "#7c3861",
          700: "#63274b",
          800: "#421224", // Deep Aubergine
          900: "#320b1a",
          950: "#1f0510",
        },
        terracotta: {
          DEFAULT: "#D16E55",
          50: "#fdf5f3",
          100: "#faeae5",
          200: "#f6d7cf",
          300: "#efb9ac",
          400: "#e59380",
          500: "#D16E55", // Signature Terracotta
          600: "#bf553c",
          700: "#9f432d",
          800: "#843928",
          900: "#6f3326",
          950: "#3b1710",
        },
        blush: {
          DEFAULT: "#FCE6DB",
          light: "#FDF1EB",
          dark: "#F4D2C3",
        },
        dustyrose: {
          DEFAULT: "#D6A69A",
          light: "#E5C2B9",
          dark: "#BF8B7E",
        },
        gold: {
          DEFAULT: "#C6A17B",
          light: "#DFC6AA",
          dark: "#A8835E",
        },
        ivory: {
          DEFAULT: "#FFF9F4",
          pure: "#FFFFFF",
          warm: "#FDF8F3",
          dark: "#F6EFE9",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-manrope)", "Manrope", "DM Sans", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      letterSpacing: {
        luxury: "0.2em",
        wide: "0.1em",
      },
      boxShadow: {
        luxury: "0 10px 30px -10px rgba(66, 18, 36, 0.12)",
        "luxury-lg": "0 20px 40px -15px rgba(66, 18, 36, 0.2)",
        "terracotta-glow": "0 8px 25px -5px rgba(209, 110, 85, 0.3)",
      },
      borderRadius: {
        badge: "24px",
      },
    },
  },
  plugins: [],
};

export default config;
