import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      maxWidth: {
        frame: "var(--frame-width)",
      },
      minHeight: {
        frame: "var(--frame-min-height)",
      },
      spacing: {
        /* 8pt grid: 4, 8, 12, 16, 20, 24, 32 (px) */
        g1: "4px",
        g2: "8px",
        g3: "12px",
        g4: "16px",
        g5: "20px",
        g6: "24px",
        g8: "32px",
      },
      borderRadius: {
        chip: "var(--radius-chip)",
        card: "var(--radius-card)",
        sheet: "var(--radius-sheet)",
        pill: "var(--radius-pill)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        elevate: "var(--shadow-md)",
        "elevate-sm": "var(--shadow-sm)",
        "elevate-lg": "var(--shadow-lg)",
      },
      fontSize: {
        display: ["28px", { lineHeight: "34px", fontWeight: "700" }],
        title: ["22px", { lineHeight: "28px", fontWeight: "600" }],
        heading: ["18px", { lineHeight: "24px", fontWeight: "600" }],
        body: ["15px", { lineHeight: "22px", fontWeight: "400" }],
        caption: ["13px", { lineHeight: "18px", fontWeight: "500" }],
      },
      fontFamily: {
        sans: ["'Noto Sans KR'", "'Inter'", "system-ui", "sans-serif"],
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
        neon: "hsl(var(--neon-glow))",
        warm: "hsl(var(--warm))",
        lantern: "hsl(var(--lantern))",
        brand: {
          royal: "hsl(var(--brand-royal))",
          navy: "hsl(var(--brand-navy))",
          coral: "hsl(var(--accent-coral))",
          green: "hsl(var(--accent-green))",
          blue: "hsl(var(--accent-blue))",
          aqua: "hsl(var(--accent-aqua))",
          "pink-soft": "hsl(var(--accent-pink-soft))",
          "pink-light": "hsl(var(--accent-pink-light))",
          yellow: "hsl(var(--accent-yellow))",
          offwhite: "hsl(var(--neutral-offwhite))",
          lightgray: "hsl(var(--neutral-lightgray))",
          muted: "hsl(var(--neutral-muted))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
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
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
