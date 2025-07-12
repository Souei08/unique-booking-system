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
        brand: "#3B82F6", // NEW: Crisp blue accent (Tailwind's blue-500)
        strong: "#1E3A8A", // Deep navy for headings (blue-900)
        weak: "#64748B", // Muted gray-blue for secondary text (slate-500)
        "stroke-strong": "#D1D5DB", // Gray-300 for solid dividers
        "stroke-weak": "#E5E7EB", // Gray-200 for subtle dividers
        fill: "#EFF6FF", // Soft blue fill for hover or highlights (blue-50)
        background: "#FFFFFF", // Pure white for base
        neutral: "#F9FAFB", // Neutral light gray for cards/sections (gray-50)
        text: "#172554", // Dark slate for main body text (slate-900)

        // Input border design system
        "input-border": "#E4E4E7", // Default input border (very soft gray, neutral, unobtrusive)
        "input-border-focus": "#3B82F6", // Focused input border (clean blue, sky-500 / primary blue)
        "input-border-error": "#EF4444", // Error input border (light red for invalid input)
        "input-border-disabled": "#E4E4E7", // Disabled input border (same as default with opacity)
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
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        sans: ["Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
