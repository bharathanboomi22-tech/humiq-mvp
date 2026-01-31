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
        display: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        // Core semantic tokens
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
        
        // Verdict states
        verdict: {
          interview: "hsl(var(--verdict-interview))",
          caution: "hsl(var(--verdict-caution))",
          pass: "hsl(var(--verdict-pass))",
        },
        
        // Signal levels
        signal: {
          high: "hsl(var(--signal-high))",
          medium: "hsl(var(--signal-medium))",
          low: "hsl(var(--signal-low))",
        },
        
        // Extended surface palette
        surface: {
          DEFAULT: "hsl(var(--surface))",
          elevated: "hsl(var(--surface-elevated))",
          overlay: "hsl(var(--surface-overlay))",
        },
        
        // HumiQ Teal/Green palette
        teal: {
          DEFAULT: "hsl(168, 75%, 48%)",
          bright: "hsl(168, 85%, 55%)",
          glow: "hsl(168, 80%, 60%)",
          dim: "hsl(168, 60%, 35%)",
          50: "hsl(168, 80%, 95%)",
          100: "hsl(168, 75%, 85%)",
          200: "hsl(168, 70%, 75%)",
          300: "hsl(168, 75%, 60%)",
          400: "hsl(168, 75%, 52%)",
          500: "hsl(168, 75%, 48%)",
          600: "hsl(168, 70%, 40%)",
          700: "hsl(168, 65%, 32%)",
          800: "hsl(168, 60%, 24%)",
          900: "hsl(168, 55%, 16%)",
        },
        
        green: {
          DEFAULT: "hsl(145, 65%, 42%)",
          bright: "hsl(145, 75%, 50%)",
          dim: "hsl(145, 55%, 30%)",
        },
        
        // Legacy metaview namespace (for backward compatibility)
        metaview: {
          bg: "hsl(160, 35%, 3%)",
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
        "3xl": "20px",
        "4xl": "28px",
      },
      transitionDuration: {
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
      },
      transitionTimingFunction: {
        'ease-out-soft': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      boxShadow: {
        'glow-teal': '0 0 20px hsla(168, 80%, 50%, 0.25)',
        'glow-teal-lg': '0 0 40px hsla(168, 80%, 50%, 0.35)',
        'glow-subtle': '0 0 30px hsla(168, 80%, 50%, 0.15)',
        'premium': '0 8px 32px -8px hsla(0, 0%, 0%, 0.5), 0 0 0 1px hsla(0, 0%, 100%, 0.02) inset',
        'card': '0 4px 24px -4px hsla(0, 0%, 0%, 0.4)',
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
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(8px, -8px) scale(1.01)" },
          "66%": { transform: "translate(-4px, 4px) scale(0.99)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.03)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsla(168, 80%, 50%, 0.2)" },
          "50%": { boxShadow: "0 0 40px hsla(168, 80%, 50%, 0.4)" },
        },
        "scroll-vertical": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 300ms ease-out",
        "accordion-up": "accordion-up 300ms ease-out",
        "fade-up": "fade-up 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 400ms ease-out forwards",
        "float": "float 16s ease-in-out infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        "scroll-vertical": "scroll-vertical 30s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
