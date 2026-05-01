import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#145C37",
          "primary-hover": "#0F4A2C",
          "primary-muted": "#E8F4ED",
          secondary: "#3154B7",
          "secondary-muted": "#E8EEFC"
        },
        surface: {
          default: "#F7F8F5",
          elevated: "#FFFFFF",
          muted: "#EFF2ED",
          "skeleton-base": "#E4E9E2",
          "skeleton-highlight": "#F4F6F2",
          inverse: "#101510"
        },
        text: {
          primary: "#101510",
          secondary: "#4C5A50",
          muted: "#6D776F",
          inverse: "#FFFFFF"
        },
        border: {
          subtle: "#DDE3DC",
          strong: "#B8C4BB"
        },
        state: {
          success: "#16834A",
          danger: "#B42318",
          warning: "#B7791F",
          info: "#3154B7"
        }
      },
      borderRadius: {
        ui: "0.875rem",
        "ui-sm": "0.625rem",
        "ui-lg": "1.25rem"
      },
      boxShadow: {
        card: "0 16px 40px rgba(16, 21, 16, 0.08)",
        "card-hover": "0 22px 55px rgba(16, 21, 16, 0.12)",
        "button-primary": "0 12px 26px rgba(20, 92, 55, 0.24)"
      },
      fontSize: {
        "heading-1": ["2.5rem", { lineHeight: "1.05", fontWeight: "700" }],
        "heading-2": ["2rem", { lineHeight: "1.1", fontWeight: "700" }],
        "heading-3": ["1.5rem", { lineHeight: "1.2", fontWeight: "650" }],
        body: ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        label: ["0.8125rem", { lineHeight: "1.2", fontWeight: "650" }],
        caption: ["0.75rem", { lineHeight: "1.4", fontWeight: "500" }],
        "caption-small": ["0.6875rem", { lineHeight: "1.35", fontWeight: "500" }]
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" }
        }
      },
      animation: {
        shimmer: "shimmer 1.8s ease-in-out infinite"
      }
    }
  },
  plugins: []
} satisfies Config;
