import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

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
      colors: {
        // ====== shadcn / main site (HSL CSS vars) ======
        // The DEFAULT entries fall back to shadcn's --primary etc. when --color-primary
        // (the configurator's hex tokens) isn't set. Inside [data-theme="..."] blocks,
        // the configurator's --color-* tokens take over and the same Tailwind classes
        // resolve to the chosen theme's values. This is how the component-library/
        // sections render with the correct theme inside LivePreview without needing
        // an iframe.
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "var(--color-border, hsl(var(--border)))",
        primary: {
          DEFAULT: "var(--color-primary, hsl(var(--primary)))",
          foreground: "var(--color-primary-text, hsl(var(--primary-foreground)))",
          hover: "var(--color-primary-hover)",
          text: "var(--color-primary-text)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary, hsl(var(--secondary)))",
          foreground: "hsl(var(--secondary-foreground))",
          hover: "var(--color-secondary-hover)",
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
          DEFAULT: "var(--color-accent, hsl(var(--accent)))",
          foreground: "hsl(var(--accent-foreground))",
          hover: "var(--color-accent-hover)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
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

        // ====== Component library tokens (used inside LivePreview only) ======
        // These map to the configurator's --color-* variables defined in
        // src/component-library/themes/*.css. They are scoped to the data-theme
        // block. Outside of data-theme, they fall back to shadcn equivalents so
        // anything accidentally using them still renders.
        bg: "var(--color-bg, hsl(var(--background)))",
        "bg-secondary": "var(--color-bg-secondary, hsl(var(--muted)))",
        "bg-tertiary": "var(--color-bg-tertiary, hsl(var(--muted)))",
        surface: "var(--color-surface, hsl(var(--card)))",
        "surface-hover": "var(--color-surface-hover, hsl(var(--accent)))",
        "text-primary": "var(--color-text-primary, hsl(var(--foreground)))",
        "text-secondary": "var(--color-text-secondary, hsl(var(--muted-foreground)))",
        "text-muted": "var(--color-text-muted, hsl(var(--muted-foreground)))",
        "text-inverse": "var(--color-text-inverse, hsl(var(--primary-foreground)))",
        "border-hover": "var(--color-border-hover, hsl(var(--border)))",
        success: "var(--color-success, #10b981)",
        error: "var(--color-error, hsl(var(--destructive)))",
        warning: "var(--color-warning, #f59e0b)",
      },
      fontFamily: {
        // Configurator components use these — fall back to the site default.
        heading: ["var(--font-heading, Inter)", "system-ui", "sans-serif"],
        body: ["var(--font-body, Inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono, monospace)"],
      },
      fontSize: {
        // Used by hero variants in component library.
        display: "var(--font-size-display, 4rem)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "var(--radius-xl, 1rem)",
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
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
