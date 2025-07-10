module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/globals.css",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          orange: '#f79533',
          coral: '#f37055', 
          pink: '#ef4e7b',
          purple: '#a166ab',
          blue: '#5073b8',
          teal: '#1098ad',
          green: '#07b39b',
          mint: '#6fba82',
        },
        secondary: {
          'dark-blue': '#1a2b4e',
          'medium-gray': '#64748b',
          'light-gray': '#f1f5f9',
          white: '#ffffff',
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b', 
          error: '#ef4444',
          info: '#3b82f6',
        },
        industry: {
          medical: '#059669',
          legal: '#1e40af',
          sales: '#dc2626',
        }
      },
      backgroundImage: {
        gradient:
          "linear-gradient(60deg, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82)",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Lexend', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        opacity: "opacity 0.25s ease-in-out",
        appearFromRight: "appearFromRight 300ms ease-in-out",
        appearFromLeft: "appearFromLeft 300ms ease-in-out",
        appearFromBottom: "appearFromBottom 400ms ease-in-out",
        wiggle: "wiggle 1.5s ease-in-out infinite",
        popup: "popup 0.25s ease-in-out",
        shimmer: "shimmer 3s ease-out infinite alternate",
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        opacity: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        appearFromRight: {
          "0%": { opacity: 0.3, transform: "translate(15%, 0px);" },
          "100%": { opacity: 1, transform: "translate(0);" },
        },
        appearFromLeft: {
          "0%": { opacity: 0.3, transform: "translate(-15%, 0px);" },
          "100%": { opacity: 1, transform: "translate(0);" },
        },
        appearFromBottom: {
          "0%": { opacity: 0, transform: "translateY(20px);" },
          "100%": { opacity: 1, transform: "translateY(0);" },
        },
        wiggle: {
          "0%, 20%, 80%, 100%": {
            transform: "rotate(0deg)",
          },
          "30%, 60%": {
            transform: "rotate(-2deg)",
          },
          "40%, 70%": {
            transform: "rotate(2deg)",
          },
          "45%": {
            transform: "rotate(-4deg)",
          },
          "55%": {
            transform: "rotate(4deg)",
          },
        },
        popup: {
          "0%": { transform: "scale(0.8)", opacity: 0.8 },
          "50%": { transform: "scale(1.1)", opacity: 1 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        shimmer: {
          "0%": { backgroundPosition: "0 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        slideDown: {
          "0%": { transform: "translateY(-100%)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      boxShadow: {
        'brand': '0 4px 14px 0 rgba(120, 76, 139, 0.39)',
        'brand-lg': '0 10px 25px -3px rgba(120, 76, 139, 0.3), 0 4px 6px -2px rgba(120, 76, 139, 0.1)',
        'medical': '0 4px 14px 0 rgba(5, 150, 105, 0.25)',
        'legal': '0 4px 14px 0 rgba(30, 64, 175, 0.25)',
        'sales': '0 4px 14px 0 rgba(220, 38, 38, 0.25)',
      },
      borderRadius: {
        'brand': '12px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        agenticvoice: {
          "primary": "#a166ab",
          "primary-focus": "#8b4a9c", 
          "primary-content": "#ffffff",
          "secondary": "#1098ad",
          "secondary-focus": "#0e7c8c",
          "secondary-content": "#ffffff",
          "accent": "#f79533",
          "accent-focus": "#e8832b",
          "accent-content": "#ffffff", 
          "neutral": "#1a2b4e",
          "neutral-focus": "#141f3a",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#f1f5f9",
          "base-300": "#e2e8f0",
          "base-content": "#1a2b4e",
          "info": "#3b82f6",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
      },
      "light", 
      "dark"
    ],
  },
};
