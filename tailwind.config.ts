import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        verdict: {
          interview: "hsl(var(--verdict-interview))",
          caution: "hsl(var(--verdict-caution))",
          pass: "hsl(var(--verdict-pass))",
        },
        signal: {
          high: "hsl(var(--signal-high))",
          medium: "hsl(var(--signal-medium))",
          low: "hsl(var(--signal-low))",
        },
        pink: {
          hot: "#FF2FB2",
          vibrant: "#FF4FD1",
          light: "#FF6BD6",
          wash: "#FFF0F7",
        },
        violet: {
          DEFAULT: "#7C3AED",
          light: "#A78BFA",
        },
        magenta: "#FF2FB2",
        metaview: {
          bg: "hsl(160, 30%, 4%)",
          "bg-deep": "hsl(160, 35%, 3%)",
          surface: "hsl(160, 25%, 8%)",
          "surface-elevated": "hsl(160, 22%, 12%)",
          border: "hsl(160, 20%, 18%)",
          accent: "hsl(168, 75%, 48%)",
          "accent-bright": "hsl(168, 85%, 55%)",
          "accent-glow": "hsl(168, 80%, 60%)",
          text: "hsl(0, 0%, 98%)",
          "text-muted": "hsl(160, 10%, 60%)",
          "text-subtle": "hsl(160, 8%, 45%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "24px",
        "4xl": "32px",
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '900': '900ms',
      },
      transitionTimingFunction: {
        'ease-out-soft': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      boxShadow: {
        'glow-pink': '0 0 20px rgba(255, 47, 178, 0.3)',
        'glow-pink-lg': '0 0 40px rgba(255, 47, 178, 0.4)',
        'glow-violet': '0 0 20px rgba(124, 58, 237, 0.3)',
        'premium': '0 4px 24px -4px rgba(0, 0, 0, 0.06), 0 12px 40px -8px rgba(0, 0, 0, 0.08)',
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
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(10px, -10px) scale(1.02)" },
          "66%": { transform: "translate(-5px, 5px) scale(0.98)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 47, 178, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(255, 47, 178, 0.5)" },
        },
        "scroll-vertical": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 400ms ease-out",
        "accordion-up": "accordion-up 400ms ease-out",
        "fade-up": "fade-up 600ms ease-out forwards",
        "fade-in": "fade-in 500ms ease-out forwards",
        "float": "float 16s ease-in-out infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "scroll-vertical": "scroll-vertical 30s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;