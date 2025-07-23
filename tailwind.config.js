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
        neutral: "#f4f5f7", // Neutral light gray for cards/sections (gray-50)
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
        // Display sizes for hero sections
        "display-2xl": ["4.5rem", { lineHeight: "1.1" }], // 72px
        "display-xl": ["3.75rem", { lineHeight: "1.2" }], // 60px
        "display-lg": ["3rem", { lineHeight: "1.2" }], // 48px
        "display-base": ["2.25rem", { lineHeight: "1.3" }], // 36px
        "display-sm": ["1.875rem", { lineHeight: "1.3" }], // 30px

        // Heading sizes
        "h1-xl": ["2.5rem", { lineHeight: "1.3" }], // 40px
        "h1-lg": ["2.25rem", { lineHeight: "1.3" }], // 36px
        "h1-base": ["2rem", { lineHeight: "1.4" }], // 32px
        "h1-sm": ["1.75rem", { lineHeight: "1.4" }], // 28px

        "h2-xl": ["1.875rem", { lineHeight: "1.4" }], // 30px
        "h2-lg": ["1.75rem", { lineHeight: "1.4" }], // 28px
        "h2-base": ["1.5rem", { lineHeight: "1.5" }], // 24px
        "h2-sm": ["1.25rem", { lineHeight: "1.5" }], // 20px

        "h3-xl": ["1.5rem", { lineHeight: "1.5" }], // 24px
        "h3-lg": ["1.25rem", { lineHeight: "1.5" }], // 20px
        "h3-base": ["1.125rem", { lineHeight: "1.6" }], // 18px
        "h3-sm": ["1rem", { lineHeight: "1.6" }], // 16px

        // Body text sizes
        "body-2xl": ["1.25rem", { lineHeight: "1.6" }], // 20px
        "body-xl": ["1.125rem", { lineHeight: "1.6" }], // 18px
        "body-lg": ["1rem", { lineHeight: "1.6" }], // 16px
        "body-base": ["0.9375rem", { lineHeight: "1.6" }], // 15px
        "body-sm": ["0.875rem", { lineHeight: "1.5" }], // 14px
        "body-xs": ["0.8125rem", { lineHeight: "1.5" }], // 13px

        // Small text sizes
        "small-xl": ["0.875rem", { lineHeight: "1.5" }], // 14px
        "small-lg": ["0.8125rem", { lineHeight: "1.5" }], // 13px
        "small-base": ["0.75rem", { lineHeight: "1.5" }], // 12px
        "small-sm": ["0.6875rem", { lineHeight: "1.5" }], // 11px
        "small-xs": ["0.625rem", { lineHeight: "1.5" }], // 10px

        // Legacy support (keeping existing classes)
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
