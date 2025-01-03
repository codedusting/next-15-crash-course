import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      sans: ["var(--font-geist-sans)", "sans-serif"],
    },
    extend: {},
  },
  plugins: [forms],
} satisfies Config;
