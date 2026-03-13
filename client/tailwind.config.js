/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#6366f1", // Indigo
          soft: "#e0e7ff",
        },
        accent: {
          adhd: "#f59e0b", // Amber
          autism: "#10b981", // Emerald
          dyslexia: "#ef4444", // Red/Warm
          overwhelm: "#8b5cf6", // Violet
        },
        calm: {
          blue: "#f0f9ff",
          indigo: "#eef2ff",
          green: "#f0fdf4",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        dyslexic: ["OpenDyslexic", "sans-serif"],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-calm': 'pulseCalm 4s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseCalm: {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
};
