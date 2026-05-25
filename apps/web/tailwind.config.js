/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    screens: {
      sm: "480px",
      md: "768px",
      lg: "1024px",
      xl: "1260px",
      "2xl": "1420px",
      "3xl": "1720px",
    },
    extend: {
      colors: {
        // Convia light theme — matches the landing page exactly
        ink: "#0B1220",
        "ink-2": "#1E293B",
        "ink-3": "#475569",
        muted: "#64748B",
        soft: "#94A3B8",
        line: "rgba(11, 18, 32, 0.08)",
        "line-strong": "rgba(11, 18, 32, 0.14)",
        surface: "#FFFFFF",
        "surface-2": "#F8FAFC",
        "surface-3": "#F1F5F9",
        accent: "#1D4ED8",
        "accent-hover": "#1E40AF",
        "accent-soft": "#EFF6FF",
        "accent-ring": "rgba(29, 78, 216, 0.18)",
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
          950: "#172554",
        },
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        gilroy: ["Gilroy", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Gilroy", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.04em", fontWeight: "700" }],
        h1: ["3rem", { lineHeight: "1.12", letterSpacing: "-0.03em", fontWeight: "700" }],
        h2: ["2.25rem", { lineHeight: "1.18", letterSpacing: "-0.02em", fontWeight: "700" }],
        h3: ["1.75rem", { lineHeight: "1.28", letterSpacing: "-0.02em", fontWeight: "600" }],
        h4: ["1.375rem", { lineHeight: "1.35", letterSpacing: "-0.015em", fontWeight: "600" }],
        h5: ["1.125rem", { lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.6", fontWeight: "600" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5", fontWeight: "600" }],
        caption: ["0.8125rem", { lineHeight: "1.45", fontWeight: "600" }],
        overline: ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.08em", fontWeight: "700" }],
      },
      boxShadow: {
        card: "0 1px 0 rgba(11,18,32,0.04), 0 1px 3px rgba(11,18,32,0.06)",
        "card-lg":
          "0 1px 0 rgba(11,18,32,0.04), 0 12px 28px -8px rgba(11,18,32,0.08), 0 4px 8px -2px rgba(11,18,32,0.04)",
        cta: "0 1px 0 0 rgba(255,255,255,0.18) inset, 0 8px 24px -8px rgba(29,78,216,0.40), 0 1px 2px rgba(11,18,32,0.08)",
        "ring-accent": "0 0 0 4px rgba(29, 78, 216, 0.12)",
      },
      backgroundImage: {
        "accent-gradient": "linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)",
        "dot-pattern":
          "radial-gradient(circle at 1px 1px, rgba(11,18,32,0.07) 1px, transparent 0)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out forwards",
        "slide-in-right": "slide-in-right 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      maxWidth: {
        container: "1280px",
      },
    },
  },
  plugins: [],
};
