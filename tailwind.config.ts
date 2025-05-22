import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        geist: "var(--font-geist-sans)",
        geistMono: "var(--font-geist-mono)",
        roboto: "var(--font-roboto)",
        nunito: "var(--font-nunito)",
      },
    },
  },
  plugins: [],
};

export default config;
