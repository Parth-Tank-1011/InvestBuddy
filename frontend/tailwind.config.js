/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0f172a",
          900: "#111827",
          850: "#162033",
          800: "#1e293b",
        },
      },
      textColor: {
        // Add custom colors that use CSS variables
        'theme-text': 'var(--text)',
        'theme-muted': 'var(--text-muted)',
        'theme-accent': 'var(--accent)',
      },
      borderColor: {
        'theme-border': 'var(--border)',
      },
      backgroundColor: {
        'theme-card': 'var(--card)',
        'theme-surface': 'var(--surface)',
        'theme-surface-soft': 'var(--surface-soft)',
      },
      boxShadow: {
        soft: "0 18px 45px rgba(0, 0, 0, 0.28)",
        glow: "0 0px 30px rgba(34, 211, 238, 0.25)",
      },
      animation: {
        "fade-in": "fadeIn 420ms ease-out both",
        shimmer: "shimmer 1.5s infinite linear",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "float-faster": "float 4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-700px 0" },
          "100%": { backgroundPosition: "700px 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "50%": { transform: "translateY(-20px) translateX(20px)" },
        },
      },
    },
  },
  plugins: [],
};