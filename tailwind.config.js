/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#0bb3d9",
        strong: "#033F65",
        weak: "#486A80",
        "stroke-strong": "#6dc2d8",
        "stroke-weak": "#a8dce9",
        fill: "#d5eff6",
        background: "#ffffff",
      },

      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
        12: "48px",
        16: "64px",
        20: "80px",
        24: "96px",
        32: "128px",
        40: "160px",
        48: "192px",
        56: "224px",
        64: "256px",
      },
      fontSize: {
        display: ["3rem", { lineHeight: "1.2" }], // 48px / 58px
        h1: ["2.25rem", { lineHeight: "1.3" }], // 36px / 47px
        h2: ["1.75rem", { lineHeight: "1.4" }], // 28px / 39px
        "body-lg": ["1.125rem", { lineHeight: "1.6" }], // 18px / 29px
        body: ["1rem", { lineHeight: "1.6" }], // 16px / 26px
        small: ["0.875rem", { lineHeight: "1.5" }], // 14px / 21px
        tiny: ["0.75rem", { lineHeight: "1.5" }], // 12px / 18px
      },
    },
  },
  plugins: [],
};
